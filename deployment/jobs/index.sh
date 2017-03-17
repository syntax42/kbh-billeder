#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Generate a job from the template
ktmpl -p BRANCH $BRANCH -p MODE $MODE -p EXTRA "$EXTRA" $DIR/index.yaml # | kubectl create -n $NAMESPACE -f -
