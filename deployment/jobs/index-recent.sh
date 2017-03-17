#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Generate a job from the template
ktmpl -p BRANCH $BRANCH $DIR/index-recent.yaml | kubectl create -n $NAMESPACE -f -
