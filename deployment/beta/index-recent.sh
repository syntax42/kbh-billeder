#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BRANCH="master"
NAMESPACE="beta"

source $DIR/../jobs/index-recent.sh
