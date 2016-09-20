#!/bin/sh

export NODE_ENV=development
export PATH=/usr/local/bin:$PATH

cd /home/csuser/Applications/cpk-local/
node index.js >> output-log.txt