#!/bin/bash

PUBLIC_IP=$(curl ipinfo.io/ip)
echo $PUBLIC_IP

aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch file://update-route53.json
