FROM node:12

RUN apt-get update && apt-get install -y ffmpeg && mkdir /app
WORKDIR /app

COPY . .

RUN npm ci && npm run build

ENTRYPOINT ["npm", "start"]