#!/bin/bash
set -e

echo "Running build script..."
sh ./build.sh

echo "Starting containers..."
docker compose up --build