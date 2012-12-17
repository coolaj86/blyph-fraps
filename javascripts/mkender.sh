#!/bin/bash
rm -rf node_modules
ender build json-storage md5 jQuery url querystring futures campusbooks isbn

cat ender.js > ender.int.js
rm ender.js
echo 'window.FormData = window.FormData || function FormData() {};' >> ender.js
cat ender.int.js >> ender.js
rm ender.int.js
