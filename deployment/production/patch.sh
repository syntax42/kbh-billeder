#!/bin/bash

# Exit on any error
set -e

IMAGE_PATH="eu.gcr.io/${GCLOUD_PROJECT}/frontend:$CIRCLE_BRANCH-latest"

# Push the frontend images to
$GCLOUD docker -- push $IMAGE_PATH

