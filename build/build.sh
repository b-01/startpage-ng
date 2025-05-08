#!/bin/bash

# create dist folder
mkdir -p dist
# minify css and javascript
./minify -o dist/main.min.css ../src/main.css
./minify -o dist/main.min.js ../src/main.js
# minify html
./minify --html-keep-document-tags -o dist/startpage.html ../src/startpage.html
# replace std resources with .min.
sed -i -e 's/main.css/main.min.css/g' dist/startpage.html
sed -i -e 's/main.js/main.min.js/g' dist/startpage.html
echo "Done!"