#!/bin/bash
npx sequelize-cli db:migrate

node dist/index.js