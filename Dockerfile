# Stage base
FROM node:lts-alpine as base

RUN npm install --global dotenv-cli
WORKDIR /app
COPY package.json yarn.lock ./


# Stage builder
FROM base as builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn prisma:generate-all
RUN yarn build

ENTRYPOINT [ "yarn", "start:prod" ]
