FROM nginx:alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY . /usr/share/nginx/html

ENV BACKEND_URL=http://backend:3000

EXPOSE 8080
