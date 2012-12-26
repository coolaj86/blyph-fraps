grep '#' -R ./less/ \
  | cut -d ':' -f2 \
  | cut -d '{' -f 1 \
  | grep '#' \
  | cut -d ' ' -f1 \
  | while read ID
  do
    grep $ID index.jade || echo "NO $ID"
  done \
  | grep NO

grep '\.' -R ./less/ \
  | cut -d ':' -f2 \
  | cut -d '{' -f 1 \
  | grep '\.' \
  | cut -d ' ' -f1 \
  | while read ID
  do
    grep $CL index.jade -R ./lib || echo "NO $CL"
  done \
  | grep NO

grep '\s\+\.[^cj]' index.jade \
  | cut -d '.' -f 2 \
  | cut -d ' ' -f1 \
  | cut -d '(' -f1 \
  | sort -u \
  | while read CL
    do
      grep $CL -R ./less ./lib || echo NO $CL
    done \
  | grep NO
