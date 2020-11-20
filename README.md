# easypoll-graphql API

[![Actions Status](https://github.com/antonio-junior/easypoll-graphql/workflows/build/badge.svg)](https://github.com/antonio-junior/easypoll-graphql/actions)
[![License: MIT](https://img.shields.io/github/license/antonio-junior/easypoll-graphql)](https://opensource.org/licenses/MIT)
[![Codacy Quality](https://api.codacy.com/project/badge/Grade/67586e978b08441eb4900d1c96e6b853)](https://app.codacy.com/manual/antonio-junior/easypoll-graphql?utm_source=github.com&utm_medium=referral&utm_content=antonio-junior/easypoll-graphql&utm_campaign=Badge_Grade_Dashboard)
[![Codacy Coverage](https://app.codacy.com/project/badge/Coverage/805bcad4a1324b93b46cfbb8f6cf9b02)](https://www.codacy.com/manual/antonio-junior/easypoll-graphql?utm_source=github.com&utm_medium=referral&utm_content=antonio-junior/easypoll-graphql&utm_campaign=Badge_Coverage)
![Language ](https://img.shields.io/github/languages/top/antonio-junior/easypoll-graphql)
![Code size](https://img.shields.io/github/languages/code-size/antonio-junior/easypoll-graphql)
![Repo size](https://img.shields.io/github/repo-size/antonio-junior/easypoll-graphql)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Stack


## Commands:

First of all, create a .env file and configure its variables following .env.example

Run tests  
```
npm test
```

Starts database container
```
docker run -d --name postgres \
-e POSTGRES_DB=<DB_NAME> \
-e POSTGRES_PASSWORD=<DB_PASSWORD> \
-e POSTGRES_USER=<DB_USER> \
-v /home/docker/postgres:/var/lib/postgresql/data \
-p 5432:5432 \
postgres:12
```

Run application locally in dev mode
```
npm run dev
```

Build image from Dockerfile
```
docker build -t <IMAGE_NAME>:<TAG> .
```

Start services specified in docker-compose.yml
```
docker-compose up -d
```

Build the service before starting services
```
docker-compose up -d --build
```

Start application in a container from docker hub image
```
docker run --name easypoll-graphql -it --env-file .env antoniocsjunior/easypoll-graphql
```
