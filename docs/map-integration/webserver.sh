#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "${SCRIPT_DIR}"

echo "Starting webserver"
# Start the webserver on a random port, also include VIRTUAL_HOST for support
# FreedomBen/dory or jwilder/nginx-proxy.
docker run --rm -p 80 -e VIRTUAL_HOST=contract.kbhbilleder.docker --name kbh-billeder-contract -v "${SCRIPT_DIR}/../../app:/usr/share/nginx/html/app" -v "${SCRIPT_DIR}/contract:/usr/share/nginx/html" nginx
