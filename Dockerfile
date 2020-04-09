FROM node:13.12.0-alpine3.11

RUN apk update && apk add ffmpeg && mkdir /app
WORKDIR /app

COPY . .

RUN npm ci && npm run build

CMD ["npm", "start", "--", "--input", "/source", "--output", "/destination"]