#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAMESPACE="production"
ES_DISK_NAME="es-production-disk"
MONGO_DISK_NAME="mongo-production-disk"
FRONTEND_PUBLIC_IP="146.148.25.25"
FRONTEND_PUBLIC_HOSTNAME="kbhbilleder.dk"
BRANCH="production"

source $DIR/../initial.sh
