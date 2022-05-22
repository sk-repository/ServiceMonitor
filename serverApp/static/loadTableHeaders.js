const tableOfHeaders = [
  "Server Name",
  "PostgreSQL",
  "Wildfly",
  "PM2",
  "RDM.js",
  "PxMAP",
  "VideoProxy",
  "ShinyServer",
  "PxDA-DP",
  "PxVS-DP",
  "PxVS-TP",
  "PxVS-DC",
  "ProFTPd",
  "OsrmBackend",
  "ntpd",
  "OpenVPN",
  "/",
  "/var/log",
  "/var/lib/pgsql",
  "/pixel"
]

const mapOfHeaders = new Map([
  ["postgres", "PostgreSQL"],
  ["wildfly", "Wildfly"],
  ["pm", "PM2"],
  ["rdm", "RDM.js"],
  ["pxmap", "PxMAP"],
  ["videoproxy", "VideoProxy"],
  ["shinyserver", "ShinyServer"],
  ["pxda-dp", "PxDA-DP"],
  ["pxvs-dp", "PxVS-DP"],
  ["pxvs-tp", "PxVS-TP"],
  ["pxvs-dc", "PxVS-DC"],
  ["proftpd", "ProFTPd"],
  ["osrm", "OsrmBackend"],
  ["ntpserver", "ntpd"],
  ["ovpn", "OpenVPN"],
  ["root", "/"],
  ["logs", "/var/log"],
  ["pgsql", "/var/lib/pgsql"],
  ["pixel", "/pixel"]
])

const mapOfStorage = new Map([
  ["\"/\"", 'root'],
  ["\"/var/log\"", "logs"],
  ["\"/var/lib/pgsql\"", "pixel"],
  ["\"/pixel\"", "pgsql"]
]);

window.onload = function () {
  loadHeadersToTable();
  setDateOfLastUpdate();
}

function setDateOfLastUpdate() {
  var today = new Date();
  var date = today.getFullYear() + '.' + (today.getMonth() < 10 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1) + '.' + (today.getDate() < 10 ? '0' + today.getDate() : today.getDate());
  var time = (today.getHours() < 10 ? '0' + today.getHours() : today.getHours()) + ":" + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()) + ":" + (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds());
  var dateTime = 'Aktualizacja  ' + date + ' ' + time;
  document.getElementById('timestamp').innerHTML = dateTime;
}

const getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    var status = xhr.status;

    if (status == 200) {
      callback(null, xhr.response);
    } else {
      callback(status);
    }
  };

  xhr.send();
};

// http://127.0.0.1:3074/api/getAllStatus

getJSON('http://192.168.200.37:3074/api/getAllStatus', function (err, data) {
  if (err != null) {
    console.error(err);
  } else {
    loadDataToTable(data)
  }
});

function loadDataToTable(data) {
  for (var i = 0; i < data.length; i++) {
    var iDiv = document.createElement('div');
    iDiv.id = 'data_' + i;

    if (i % 2 != 0) {
      iDiv.style.backgroundColor = "#2d3847";
    } else {
      iDiv.style.backgroundColor = "#3a4555";
    }

    ifUptimeIsNotActuallClearRow(data[i], iDiv);

    iDiv.className = 'data_row';
    var tableHeaders = document.getElementById("table_data");
    tableHeaders.appendChild(iDiv);

    var iiDiv = document.createElement('div');
    iiDiv.id = "data_card_" + i;
    iiDiv.className = 'data_card';
    iiDiv.style.flex = 2
    var s = document.getElementById('data_' + i);
    s.appendChild(iiDiv);

    var iiiDiv = document.createElement('div');
    iiiDiv.className = 'data_text';
    iiiDiv.textContent = data[i].host_name;
    iiiDiv.style.fontSize = "16px";
    var s = document.getElementById('data_card_' + i);
    s.appendChild(iiiDiv);

    for (var j = 1; j < tableOfHeaders.length; j++) {
      var serviceDiv = document.createElement('div');
      serviceDiv.id = "data_card_" + data[i].host_name + "_" + tableOfHeaders[j].toLowerCase();
      serviceDiv.className = "data_card";
      var s = document.getElementById('data_' + i);
      s.appendChild(serviceDiv);
    }
  }
  loadDataToRows(data)
}

function loadDataToRows(data) {
  for (var i = 0; i < data.length; i++) {
    loadServices(data, i)
    loadStorage(data, i)
  }
}

function isUptimeNotActuall(data) {
  var dataDifference = new Date().getTime() - data.timestamp

  if (dataDifference > 600000) {
    return true
  } else {
    return false
  }
}

function ifUptimeIsNotActuallClearRow(data, div) {
  if (isUptimeNotActuall(data)) {
    div.style.backgroundColor = "#fcb1b2";
  }
}

function loadServices(data, i) {
  for (var j = 0; j < data[i].services.length; j++) {
    if (document.getElementById("data_card_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase()) != null) {
      var img = document.createElement('i');
      img.id = "data_img_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase();
      img.className = "data_img";
      var s = document.getElementById("data_card_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase());
      s.appendChild(img);

      setSVG(data, i, j);

      var serviceDataDiv = document.createElement('div');
      serviceDataDiv.id = "data_text_" + data[i].host_name + "_" + tableOfHeaders[j].toLowerCase();
      serviceDataDiv.className = "data_text";
      serviceDataDiv.textContent = getResponseTime(serviceDataDiv, data, i, j)
      var s = document.getElementById("data_card_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase());
      s.appendChild(serviceDataDiv);
    }
  }
}

function calculateSecondsToHHMM(totalSeconds) {
  hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;

  if (hours > 24) {
    days = Math.floor(hours / 24);
    hours = hours - (days * 24)
    return days + "d " + hours + "h"
  } else {
    return hours + "h " + minutes + "m"
  }
}

function getResponseTime(serviceDataDiv, data, i, j) {
  if (!isUptimeNotActuall(data[i])) {
    return calculateSecondsToHHMM(data[i].services[j].uptime)
  } else {
    serviceDataDiv.style.color = "#c96c6d"
    return "-"
  }
}

function setSVG(data, i, j) {
  if (!isUptimeNotActuall(data[i])) {
    if (data[i].services[j].status == "ok") {
      if (i % 2 != 0) {
        document.getElementById("data_img_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase()).outerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" color="#2d3847" height="32" viewBox="0 0 512 512"><title>Checkmark Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="#6aa8a9" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M352 176L217.6 336 160 272"/></svg>'
      } else {
        document.getElementById("data_img_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase()).outerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" color="#3a4555" height="32" viewBox="0 0 512 512"><title>Checkmark Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="#6aa8a9" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M352 176L217.6 336 160 272"/></svg>'
      }
    } else {
      if (i % 2 != 0) {
        document.getElementById("data_img_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase()).outerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" color="#2d3847" height="32" viewBox="0 0 512 512"><title>Close Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="#fcb1b2" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l128-128"/></svg>'
      } else {
        document.getElementById("data_img_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase()).outerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" color="#3a4555" height="32" viewBox="0 0 512 512"><title>Close Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="#fcb1b2" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l128-128"/></svg>'
      }
    }
  } else {
    document.getElementById("data_img_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].services[j].name).toLowerCase()).outerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" color="#c96c6d" height="32" viewBox="0 0 512 512"><title>Close Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="#fcb1b2" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l128-128"/></svg>'
  }
}

function loadStorage(data, i) {
  for (var j = 0; j < data[i].storages.length; j++) {
    if (document.getElementById("data_card_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].storages[j].mnt).toLowerCase()) != null) {
      var storageDataDiv = document.createElement('div');
      storageDataDiv.id = "data_text_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].storages[j].mnt).toLowerCase();
      storageDataDiv.className = "data_text";
      storageDataDiv.style.fontSize = "20px"

      fillStorage(data, storageDataDiv, i, j)
      var s = document.getElementById("data_card_" + data[i].host_name + "_" + mapOfHeaders.get(data[i].storages[j].mnt).toLowerCase());
      s.appendChild(storageDataDiv);
    }
  }
}

function fillStorage(data, storageDataDiv, i, j) {
  if (!isUptimeNotActuall(data[i])) {
    storageDataDiv.textContent = data[i].storages[j].used

    if ((parseFloat(data[i].storages[j].used) / 100) > 0.5
      && (parseFloat(data[i].storages[j].used) / 100) < 0.8) {
      storageDataDiv.style.color = "#f0b041"
    } else if ((parseFloat(data[i].storages[j].used) / 100) >= 0.8) {
      storageDataDiv.style.color = "#fcb1b2"
    } else {
      storageDataDiv.style.color = "#6aa8a9"
    }
  } else {
    storageDataDiv.textContent = "-"
    storageDataDiv.style.color = "#c96c6d"
  }
}

function loadHeadersToTable() {
  for (var i = 0; i < tableOfHeaders.length; i++) {
    var iDiv = document.createElement('div');
    iDiv.id = 'header_' + i;
    iDiv.className = 'header_card';
    if (i == 0) {
      iDiv.style.flex = 2
    }
    var tableHeaders = document.getElementById("table_headers");
    tableHeaders.appendChild(iDiv);

    var iiDiv = document.createElement('div');
    iiDiv.className = 'header_text';
    iiDiv.textContent = tableOfHeaders[i];
    var s = document.getElementById('header_' + i);
    s.appendChild(iiDiv);
  }
}