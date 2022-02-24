#!/bin/bash
# DB_HOST = docker inspect <DB-INSTANCE-ID> | grep IPAddress | tail -1
MSYS_NO_PATHCONV=1 docker run -it -v "/$(pwd):/app" -w /app nikolaik/python-nodejs bash -c "npm install --save pg@latest && npm run db:migrate"