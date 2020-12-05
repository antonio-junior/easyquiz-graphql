FROM node:12 AS BUILD_IMAGE

WORKDIR /app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm run build

RUN npm test

# remove development dependencies
RUN npm prune --production


FROM node:12-alpine

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

COPY --from=BUILD_IMAGE /app/dist/database/config.js /app/config/config.js
COPY --from=BUILD_IMAGE /app/dist/database/migrations /app/migrations

COPY --from=BUILD_IMAGE /app/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["sh", "/app/start.sh"]