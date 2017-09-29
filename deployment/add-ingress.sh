#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Update the service for the frontend.
#ktmpl \
#  -p FRONTEND_PUBLIC_IP $FRONTEND_PUBLIC_IP \
#  $DIR/frontend-service.yaml \
#  | kubectl apply -n $NAMESPACE -f -

# Setup https ingress
ktmpl \
  -p FRONTEND_PUBLIC_IP_NAME $FRONTEND_PUBLIC_IP_NAME \
  -p FRONTEND_PUBLIC_HOSTNAME $FRONTEND_PUBLIC_HOSTNAME \
  $DIR/frontend-ingress.yaml \
  | kubectl apply -n $NAMESPACE -f -

