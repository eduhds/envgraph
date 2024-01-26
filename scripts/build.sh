#!/bin/bash

rm -rf build 2> /dev/null

yarn build --out-dir=build/dist

go build -o build/envgraph main.go

tar -C build -czf build/envgraph.tar.gz envgraph dist
