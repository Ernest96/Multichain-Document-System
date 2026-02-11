FROM node:20-alpine
WORKDIR /app

# deps pentru SWG
COPY swg/package*.json ./swg/
RUN cd swg && npm ci

# copiem codul SWG și public ca foldere surori
COPY swg ./swg
COPY public ./public
COPY config ./config

ENV NODE_ENV=production

EXPOSE 3000

# rulăm swg.js din mapa swg
WORKDIR /app/swg
CMD ["node", "swg.js"]
