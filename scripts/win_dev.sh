#!/bin/bash
MSYS_NO_PATHCONV=1 docker run -it -p 8080:8080 -v "$(pwd):/app" -w /app nikolaik/python-nodejs bash -c "npm install -g nodemon && npm run dev-legacy"
# nodemon ./bin/www --exec ".\node_modules\.bin\tsc.cmd && node dist/index.js || exit 1" -e ts