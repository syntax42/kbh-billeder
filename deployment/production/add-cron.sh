#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAMESPACE="production"
FRONTEND_PUBLIC_HOSTNAME="kbhbilleder.dk"
KBH_ACCESS_KEY=${KBH_ACCESS_KEY}
# All hours except at 04
INCREMENTAL_TIMING="02 02 0,1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *"
# Full reindex at 02
FULL_TIMING="02 12 4 * * *"
source $DIR/../add-cron.sh
