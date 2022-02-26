#!/bin/bash
# erase /data: rm -Rf data
# start DB cointainer
# get DB container ID: docker inspect <DB-INSTANCE-ID> | grep IPAddress | tail -1
# update .env: DB_HOST
# migrate
# revert .env
MSYS_NO_PATHCONV=1 docker run -it -v "/$(pwd):/app" -w /app nikolaik/python-nodejs bash -c "npm install --save pg@latest && npm run db:migrate"