#!/bin/bash

# Exit on any error
set -e

exit 0 # Let's not enable deployment to the staging environment, just yet

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMAGE_PATH="eu.gcr.io/${GCLOUD_PROJECT}/frontend:${CIRCLE_BRANCH}-${CIRCLE_SHA1}"
NAMESPACE="default"

source $DIR/../patch-deployment.sh
