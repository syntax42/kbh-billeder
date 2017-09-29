#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BRANCH="master"
NAMESPACE="beta"

source $DIR/../jobs/index-cron.sh
