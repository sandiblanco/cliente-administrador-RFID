FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_SERVER_URL
ARG VITE_SOCKET_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]