#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAME="index-all-vision"
MODE="all"
EXTRA="--vision=google"

source $DIR/index.sh
