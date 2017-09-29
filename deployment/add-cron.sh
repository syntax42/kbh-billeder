#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Setup cron
ktmpl \
  -p FRONTEND_PUBLIC_HOSTNAME $FRONTEND_PUBLIC_HOSTNAME \
  -p INCREMENTAL_TIMING "${INCREMENTAL_TIMING}" \
  -p FULL_TIMING "${FULL_TIMING}" \
  $DIR/cron-deployment.yaml \
  | kubectl apply -n $NAMESPACE -f -
