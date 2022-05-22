#!/bin/bash
cp ./ServiceMonitor.service /etc/systemd/system/ServiceMonitor.service
cp ./ServiceMonitorFrontend.service /etc/systemd/system/ServiceMonitorFrontend.service

systemctl daemon-reload

systemctl enable ServiceMonitor.service
systemctl enable ServiceMonitorFrontend.service

systemctl start ServiceMonitor.service
systemctl start ServiceMonitorFrontend.service
