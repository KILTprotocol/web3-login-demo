FROM node:18-alpine as builder

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build:frontend

FROM httpd:alpine3.18

COPY --from=builder /app/frontend/build /usr/local/apache2/htdocs/
