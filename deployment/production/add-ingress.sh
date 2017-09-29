#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAMESPACE="production"
FRONTEND_PUBLIC_IP_NAME="frontend-ingress-production"
FRONTEND_PUBLIC_HOSTNAME="kbhbilleder.dk"

source $DIR/../add-ingress.sh
