#!/bin/bash
echo "Cleaning up dangling images and stopped containers..."
docker container prune -f
docker image prune -f
echo "Cleanup complete."