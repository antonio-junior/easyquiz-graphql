#!/bin/bash

./update-route53.sh

npx sequelize-cli db:migrate

node dist/index.js