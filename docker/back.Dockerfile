FROM node:18-alpine as builder

WORKDIR /app

# We copy everything that we might need.
COPY . .

# we only install (dev-)dependencies for the backend
RUN yarn workspaces focus web3-login-demo-backend
# build the backend (node is more resource efficient than ts-node)
RUN yarn build:backend
# remove all devDependencies again
RUN yarn workspaces focus web3-login-demo-backend --production

CMD [ "yarn", "start:backend-prod" ]
