CACHE MANIFEST
# That must be the very first line
# comments must be on their own line

# VERSION 0.0.1
# bump the version any time you edit ANY of the CACHE assets
# otherwise they won't get updated when the app comes back online

CACHE:
# list ALL assets which should be downloaded for offline use
# no pattern matching is supported
index.html
pakmanaged.min.js

FALLBACK:
# give the offline equivalent of a 404
# the first item is always treated as a prefix pattern
# the second is always treated as the resource to provide
/online.json /offline.json
/images/ /offline.json
/ /offline.json

NETWORK:
# list any assets which are allowed to be fetched 
# from an online source even after the caching is complete
# can use * or prefix pattern matching
/online-assets/
http://www.google.com/api/search
*
