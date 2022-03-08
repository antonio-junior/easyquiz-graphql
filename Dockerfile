FROM node:12 AS BUILD_IMAGE

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# remove development dependencies
RUN npm prune --production


FROM node:12-alpine
ENV NODE_ENV production

USER node
WORKDIR /app

# copy from build image
COPY --chown=node:node --from=BUILD_IMAGE /app/dist ./dist
COPY --chown=node:node --from=BUILD_IMAGE /app/node_modules ./node_modules

COPY --chown=node:node --from=BUILD_IMAGE /app/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["sh", "/app/start.sh"]