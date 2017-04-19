#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RANDOM="$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 8 | head -n 1)"

# Generate a job from the template
ktmpl -p BRANCH $BRANCH -p NAME $NAME-$RANDOM -p MODE $MODE -p EXTRA "$EXTRA" $DIR/index.yaml | kubectl create -n $NAMESPACE -f -
