#!/bin/bash

# Exit on any error
set -e

IMAGE_PATH="eu.gcr.io/${GCLOUD_PROJECT}/frontend:$CIRCLE_BRANCH-latest"

# Push the frontend images to
$GCLOUD docker -- push $DOCKER_IMAGE

ktmpl -p GCLOUD_PROJECT $GCLOUD_PROJECT -p IMAGE_PATH $IMAGE_PATH
# kubectl patch deployment frontend -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","image":"eu.gcr.io/'"$GCLOUD_PROJECT"'/frontend:'"$CIRCLE_SHA1"'"}]}}}}'
