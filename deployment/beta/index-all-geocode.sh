#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAME="index-all-geocode"
MODE="all"
EXTRA="--geocoding"
EXTRA_2="--page-size=10"

source $DIR/index.sh
