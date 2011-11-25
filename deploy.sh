#!/bin/bash
if [ ! -f "less.min.js" ]
then
  wget "http://lesscss.googlecode.com/files/less-1.1.3.min.js" -O less.min.js
fi

if [ ! -f "javascripts/CFInstall.min.js" ]
then
  wget "http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js" -O javascripts/CFInstall.min.js
fi

if [ ! -f "javascripts/global-es5.js" ]
then
  wget "https://raw.github.com/kriskowal/narwhal-lib/3dba395ec5da18f1ef47aa651e10896764d83270/lib/narwhal/global-es5.js" -O javascripts/global-es5.js
fi

lessc style.less > style.css
jade index.jade
jade splash-page.jade
jade byu.jade
pakmanager build
cat pakmanaged.js > pakmanaged.tmp.js
echo 'window.FormData = window.FormData || function FormData() {};' >> pakmanaged.js
cat pakmanaged.tmp.js >> pakmanaged.js
uglifyjs pakmanaged.js > pakmanaged.min.js
#gzip pakmanaged.min.js -c > pakmanaged.min.js.gz
rm pakmanaged.tmp.js pakmanaged.html
sed -e "s/# VERSION.*/# VERSION `date +%s`/" main.appcache.tpl > main.appcache
