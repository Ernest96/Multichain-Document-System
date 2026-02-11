#!/bin/bash

set -e

echo "Installing SWG..."
cd swg
npm install
cd ..

echo "Installing SWG API..."
cd swg_api
npm install
cd ..

echo "Generating public config..."
cd config
npm install
node generate-public-config.js

echo "Build finished."
