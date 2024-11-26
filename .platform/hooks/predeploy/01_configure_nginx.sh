#!/bin/bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo chown -R nginx:nginx /var/app/current/dist
sudo chmod -R 755 /var/app/current/dist