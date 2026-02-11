#!/bin/bash
set -e

echo "Running build script..."
sh ./build.sh

echo "Starting apps..."
npm run start