# ---- Build Stage ----
FROM node:alpine AS build
WORKDIR /app

ARG VITE_APP_NAME
ARG VITE_ENTORNO
ARG SECRET

ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_ENTORNO=$VITE_ENTORNO
ENV SECRET=$SECRET

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Runtime Stage ----
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional: Copia una configuración personalizada de Nginx si es necesario
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]