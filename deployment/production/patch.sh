#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMAGE_PATH="eu.gcr.io/${GCLOUD_PROJECT}/frontend:${CIRCLE_BRANCH}-${CIRCLE_SHA1}"
NAMESPACE="production"

# Push the frontend images to
$GCLOUD docker -- push $IMAGE_PATH
# Patch the frontend deployment, in the correct namespace
kubectl patch deployment frontend -n $NAMESPACE -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","image":"'$IMAGE_PATH'"}]}}}}'
