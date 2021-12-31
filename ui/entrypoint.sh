#!/bin/bash

if [[ ! -e './node_modules' ]]; then
    npm install --silent --save
fi

if [[ ! $API_URL ]];then
    API_URL="http://localhost:5000/api"
fi

# update API URL in the file
sed -i "/let API_URL = /c\let API_URL = '$API_URL'"  src/uri.js
npm start