#!/bin/bash

# create dist folder
mkdir -p dist/assets/fonts-noto
# minify css and javascript
./minify -o dist/main.min.css ../src/main.css
./minify -o dist/main.min.js ../src/main.js
./minify -o dist/assets/fonts-noto/fonts-noto.min.css ../src/assets/fonts-noto/fonts-noto.css
# minify html
./minify --html-keep-document-tags -o dist/startpage.html ../src/startpage.html
# replace std resources with .min.
sed -i -e 's/main.css/main.min.css/g' dist/startpage.html
sed -i -e 's/main.js/main.min.js/g' dist/startpage.html
sed -i -e 's/fonts-noto.css/fonts-noto.min.css/g' dist/startpage.html
# copy fonts
cp ../src/assets/fonts-noto/*.woff2 dist/assets/fonts-noto
echo "Done!"
