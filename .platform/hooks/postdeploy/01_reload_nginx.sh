#!/bin/bash
sudo nginx -t && sudo systemctl reload nginx || sudo systemctl restart nginx