#!/bin/bash
if [ ! -f "less.min.js" ]
then
  wget "http://lesscss.googlecode.com/files/less-1.1.3.min.js" -O less.min.js
fi

if [ ! -f "javascripts/CFInstall.min.js" ]
then
  wget "http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js" -O javascripts/CFInstall.min.js
fi

sed -e "s/# VERSION.*/# VERSION `date +%s`/" main.appcache.tpl > main.appcache
lessc style.less > style.css
jade *.jade

# hack for byId issues
if [ ! -f "node_modules/qwery/qwery.rvagg.js" ]
then
  wget https://raw.github.com/rvagg/qwery/byId/src/qwery.js -O node_modules/qwery/qwery.rvagg.js
  cp node_modules/qwery/qwery.rvagg.js node_modules/qwery/qwery.js
fi
pakmanager build
mv pakmanaged.js > pakmanaged.tmp.js
echo 'window.FormData = window.FormData || function FormData() {};' > pakmanaged.js
cat pakmanaged.tmp.js >> pakmanaged.js
rm pakmanaged.js
uglifyjs pakmanaged.js > pakmanaged.min.js
#gzip pakmanaged.min.js -c > pakmanaged.min.js.gz
rm -f pakmanaged.tmp.js pakmanaged.html
