#!/bin/sh

rm -rf dist
mkdir dist

echo "[{\"name\":\"LEVE_HOME\",\"value\":\"\$HOME/.leve\"}]" >> ./dist/vars.json
echo "export PATH=\"\$PATH:\$LEVE_HOME\"" >> ./dist/vars.leve