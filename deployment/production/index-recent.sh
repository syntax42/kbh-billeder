#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BRANCH="production"
NAMESPACE="production"

source $DIR/../jobs/index-recent.sh
