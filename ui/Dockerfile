FROM node:14.15.0-buster
WORKDIR /app
COPY . .
RUN npm install --silent --save
CMD chmod +x /app/entrypoint.sh && /app/entrypoint.sh