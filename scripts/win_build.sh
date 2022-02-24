#!/bin/bash
MSYS_NO_PATHCONV=1 docker run -it -v "$(pwd):/app" -w /app nikolaik/python-nodejs bash -c "npm update && npm i"
