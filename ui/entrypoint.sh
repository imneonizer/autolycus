#!/bin/bash

if [[ ! -e './node_modules' ]]; then
    npm install --silent
fi

# update API URL in the file
sed -i "/let API_URL = /c\let API_URL = '$API_URL'"  src/uri.js
npm start