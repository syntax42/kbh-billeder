#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAMESPACE="beta"
ES_DISK_NAME="es-beta-disk"
MONGO_DISK_NAME="mongo-beta-disk"
FRONTEND_PUBLIC_IP="35.187.19.75"
FRONTEND_PUBLIC_HOSTNAME="beta.kbhbilleder.dk"
BRANCH="master"

source $DIR/../initial.sh
