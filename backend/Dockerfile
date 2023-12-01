FROM node:18-alpine as builder

WORKDIR /app

# We copy everything that we might need.
COPY . .

ENV NODE_ENV production

# we only install (dev-)dependencies for the backend
RUN yarn workspaces focus web3-login-demo-backend
# build the backend (node is more resource efficient than ts-node)
RUN yarn build:backend
# remove all devDependencies again
RUN yarn workspaces focus web3-login-demo-backend --production
RUN yarn cache clean

EXPOSE 8000

CMD [ "yarn", "start-prod:backend" ]
