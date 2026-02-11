FROM node:20-alpine
WORKDIR /app

# deps pentru SWG
COPY swg_api/package*.json ./swg_api/
RUN cd swg_api && npm ci

COPY swg_api ./swg_api
COPY config ./config

ENV NODE_ENV=production

EXPOSE 3001

# rulăm swg-api.js din mapa swg_api
WORKDIR /app/swg_api
CMD ["node", "swg-api.js"]
