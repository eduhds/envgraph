#!/bin/sh

rm -rf dist
mkdir dist

cp *.js ./dist
cp -r node_modules ./dist/node_modules

echo "[{\"name\":\"LEVE_HOME\",\"value\":\"\$HOME/.leve\"}]" >> ./dist/vars.json
echo "export PATH=\"\$PATH:\$LEVE_HOME\"" >> ./dist/vars.leve