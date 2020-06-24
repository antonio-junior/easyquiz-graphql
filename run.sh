#!/bin/bash

docker run --rm  \
-e DB_USER= \
-e DB_PWD= \
-e DB_HOST= \
-e DB_PORT= \
-e DB_NAME= \
-e DB_IS_POSTGRES=true \
-e SECRET_KEY= \
-e PORT=3003 \
-p 3003:3003 \
antoniocsjunior/easypoll-graphql