#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAMESPACE="beta"
FRONTEND_PUBLIC_IP_NAME="frontend-ingress-beta"
FRONTEND_PUBLIC_HOSTNAME="beta.kbhbilleder.dk"
# Only used until we can switch the IP.
FRONTEND_PUBLIC_IP="35.187.19.75"

source $DIR/../add-ingress.sh
