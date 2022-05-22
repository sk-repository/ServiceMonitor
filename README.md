# ServicesMonitor


-----


## 1. clientApp

### 1.1 Instalacja Python:
```
apt install python3 python3-pip
```

### 1.2 Uruchomienie:
```
mkdir /root/ServiceMonitorClient/
cp ./clientApp.py ./requirements.txt ./runClient.sh /root/ServiceMonitorClient/
cd /root/ServiceMonitorClient/
chmod +x ./clientApp.py ./runClient.sh
pip3 install -r requirements.txt
```

#### 1.2.1 Zawartość z pliku requirements.txt
```
requests>=2.26.0
simplejson>=3.16.0
python-dateutil>=2.7.3
```

#### 1.2.2 Konfiguracja cron dla clientApp:
```
# pobranie aktuanej listy taksów:
crontab -l > /root/ServiceMonitorClient/cronTasksDump
# dodanie nowego taksa
echo "*/2 * * * * /bin/bash /root/ServiceMonitorClient/runClient.sh" >> /root/ServiceMonitorClient/cronTasksDump
# wczytanie zmodyfikowanej listy
crontab /root/ServiceMonitorClient/cronTasksDump
```

### 1.3 Przykład "pelnego" POST:
```
/serverApp/docs/exampleClientFrame.json
```



-----



## 2. serverApp

### 2.1 Przygotowanie Ubuntu Server 20.04 LTS :
```
# usuwamy śmieci:
systemctl stop accounts-daemon.service
systemctl disable accounts-daemon.service
systemctl disable systemd-networkd-wait-online.service
systemctl mask systemd-networkd-wait-online.service
apt -y purge snapd cloud-init
rm -rf /etc/cloud/ && rm -rf /var/lib/cloud/

# ustawiamy strefe czasowa:
timedatectl set-timezone Europe/Warsaw

# instalujemy narzędzia:
apt install -y mc tree net-tools netcat

# ustawiamy jezyk i kodowanie:
dpkg-reconfigure locales   # Wybieramy pl_PL.UTF8
apt update -y && apt upgrade -y

# instalacja pythona:
apt install python3 python3-pip

# instlacja "minimalistycznego" xorg:
apt install xorg xserver-xorg-core xinit xserver-xorg-video-all --no-install-recommends

# konfiguracja kernela:
nano /etc/default/grub
# dodajemy linijkę: 
GRUB_CMDLINE_LINUX_DEFAULT="video=1920x1080"

# instalacja przeglądarki:
add-apt-repository ppa:mozillateam/ppa
apt-get update
apt install firefox-esr firefox-esr-geckodriver libpci-dev scrot --no-install-recommends

# Konfiguracja XORG 
Xorg -configure
mv /root/xorg.conf.new /usr/share/X11/xorg.conf.d/xorg.conf

# W xorg.conf nalezy wyłączyć wygaszacz i osczedzanie energii !!!
# przykładowy plik /serverApp/docs/xorg.conf.d/xorg.conf

```

### 2.2 Instalowanie Pythona:
```
apt install python3 python3-pip
```

### 2.3 Uruchamianie:
```
# tworzenie folderu dla aplikacji:
mkdir /root/serverApp/
cp -r ./serverApp /root/serverApp/
# instalcja usługi Systemd:
/root/serverApp/SystemdServices.sh
```

### 2.4 Wykonywanie screenshotów otwartego okna:
```
/root/serverApp/screenshots.sh
# png przechwycone z ekranu znajdują się w folderze:
/root/serverApp/screenshots/
```

### 2.5 Dokumentcja zasobów (plik eksportowany z VSCode plugin ThunderClient):
```
/serverApp/doc/thunder-collection_ServicesMonitor.json
```

### 2.6 Interfejs:

![Screenshot](/serverApp/screenshots/ServiceMonitor-20220506_112746.png)


