#############################################################
#           Description: clientMonitor.py                   #
#           Author:      s.kloniecki@outlook.com            #
#           Date:        05.05.2022                         #
#############################################################
import datetime, subprocess, re, socket, requests, simplejson
from dateutil import tz


def get_uptime(sinceEpochTime):
    sinceIsoTime = datetime.datetime.fromtimestamp(sinceEpochTime/1000)
    nowIsoTime = datetime.datetime.now()
    uptimeSec = int((nowIsoTime - sinceIsoTime).total_seconds())
    return uptimeSec


class Server(object):
    systemServicesNameDict = {
        'postgres': 'postgresql@12-main',
        'wildfly': 'wildfly',
        'pm': 'pm2-root',
        'osrm': 'osrm-backend',
        'shinyserver': 'shiny-server',
        'pxvs-dp': 'dataprovider',
        'pxvs-tp': 'templatepreview',
        'pxvs-dc': 'pxvscompiler',
        'proftpd': 'proftpd',
        'ntpserver': 'ntp',
        'ovpn': 'openvpn@server'
    }

    nodeAppNameDict = {
        'rdm': 'rdm',
        'pxda-dp': 'PDADataProvider',
        'pxmap': 'PxMap',
        'videoproxy': 'videoServer'
    }

    systemStorageNameDict = {
        'root': '/',
        'logs': '/var/log',
        'pixel': '/pixel',
        'pgsql': '/var/lib/postgres'
    }


    ENDPOINT_URL = 'http://192.168.200.37:3074/api/statusByName'   # Local IP Addres - ServicesMonitor
    STATUS_REGEX = r"Active:(.*) since.....(.*) .*;(.*)"             # Common TZ regegx
    STORAGE_MNT_REGEX = r"(?P<mount>[\da-zA-Z\/]+)$"
    STORAGE_PERCENT_REGEX = r"(?P<percent>\d+%)"
    STORAGE_SIZE_REGEX = r"(?P<blocks>[0,0-9,0]+)*(G|M|T)"
    KEY = 0
    VALUE = 1

    def __init__(self):
        self.statusToSend = []
        self.storageToSend = []
        self.jsonObj = {}

    def get_service_status(self, servicesDict):
        for item in servicesDict.items():
            proc = subprocess.getoutput('systemctl status ' + item[self.VALUE])

            for line in proc.splitlines():
                serviceStatus = {}
                statusSearch = re.search(self.STATUS_REGEX, line)
                if statusSearch:
                    serviceStatus['name'] = item[self.KEY]

                    if 'running' in statusSearch.group(1).strip():
                        serviceStatus['status'] = 'ok'
                    else:
                        serviceStatus['status'] = 'failed'
                    sinceLocalTime = datetime.datetime.strptime(statusSearch.group(2).strip(), "%Y-%m-%d %H:%M:%S")
                    sinceEpochTime = int(sinceLocalTime.replace(tzinfo=tz.tzlocal()).timestamp()*1000)
                    serviceStatus['since'] = sinceEpochTime
                    serviceStatus['uptime'] = get_uptime(sinceEpochTime)
                    self.statusToSend.append(serviceStatus)

    def get_node_status(self, nodesDict):
        try:
            proc = subprocess.getoutput('/usr/local/bin/pm2 jlist')
            jsonOutput = simplejson.loads(proc)
        except ValueError as err:
            print(f"PM2 JSON object issue: {err}")
            return

        if jsonOutput:
            for idx in range(len(jsonOutput)):
                nodeStatus = {}
                for item in nodesDict.items():
                    if jsonOutput[idx]['name'] == item[self.VALUE]:
                        nodeStatus['name'] = item[self.KEY]
                        if 'online' == jsonOutput[idx]['pm2_env']['status']:
                            nodeStatus['status'] = 'ok'
                        else:
                            nodeStatus['status'] = 'failed'
                        sinceEpochTime = int(datetime.datetime.fromtimestamp(
                                jsonOutput[idx]['pm2_env']['pm_uptime']/1000.0).timestamp()*1000)
                        nodeStatus['since'] = sinceEpochTime
                        nodeStatus['uptime'] = get_uptime(sinceEpochTime)
                        self.statusToSend.append(nodeStatus)

    def get_storage_status(self, storagesDict):
        output = subprocess.getoutput('df -h | grep /dev/sd') # Sata storage
        # output = subprocess.getoutput('df -h | grep /dev/nvm') # NVME storage
        # output = subprocess.getoutput('df -h | grep /dev/mapper')  # LVM storage
        if output:
            for line in output.splitlines():
                storageMnt = re.search(self.STORAGE_MNT_REGEX, line)
                storagePercent = re.search(self.STORAGE_PERCENT_REGEX, line)
                storageSize = re.search(self.STORAGE_SIZE_REGEX, line)
                for item in storagesDict.items():
                    storageStatus = {}
                    if item[self.VALUE] == storageMnt.group(0).strip():
                        storageStatus['mnt'] = item[self.KEY]
                        storageStatus['used'] = storagePercent.group(0).strip()
                        storageStatus['size'] = storageSize.group(0).strip()
                        self.storageToSend.append(storageStatus)

    def build_put_body(self):
        self.jsonObj['timestamp'] = int(datetime.datetime.now().timestamp()*1000)
        self.jsonObj['host_name'] = socket.gethostname()
        self.jsonObj['services'] = self.statusToSend
        self.jsonObj['storages'] = self.storageToSend
        print(f"jsonPutBody = {self.jsonObj}")  # debug

    def put_collected_data(self):
        try:
            httpCode = requests.put(self.ENDPOINT_URL, headers={'Content-Type': 'application/json'}, json=self.jsonObj,
                                     timeout=10)
            httpCode.raise_for_status()
            print(f"Response httpCode: {httpCode.status_code}")
        except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError) as err:
            print(err)
            return


def main():
    cesip = Server()
    cesip.get_service_status(cesip.systemServicesNameDict)
    cesip.get_node_status(cesip.nodeAppNameDict)
    cesip.get_storage_status(cesip.systemStorageNameDict)
    cesip.build_put_body()
    cesip.put_collected_data()


if __name__ == '__main__':
    main()
