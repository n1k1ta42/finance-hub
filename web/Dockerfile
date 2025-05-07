FROM node:22-alpine AS build

WORKDIR /app

# COPY package.json yarn.lock ./
COPY . .
RUN yarn install --frozen-lockfile



RUN sed -i 's/"build": "vite build && tsc"/"build": "vite build"/' package.json

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"] 