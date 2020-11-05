FROM node:14.15.0-buster
WORKDIR /app
COPY . .

ENV PATH /app/node_modules/.bin:$PATH
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent
CMD ["npm", "start"]