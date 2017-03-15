#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMAGE_PATH="eu.gcr.io/${GCLOUD_PROJECT}/frontend:${CIRCLE_BRANCH}-${CIRCLE_SHA1}"
NAMESPACE="beta"

source $DIR/../patch-deployment.sh
