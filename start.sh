#!/bin/bash
NODE_ENV=prod npx sequelize-cli db:migrate

node dist/index.js