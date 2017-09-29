#!/bin/bash
# Exit on any error
set -e

# Sets up a kube-lego deployment (https://github.com/jetstack/kube-lego)
# The project will add letsencrypt-certificates to any ingress controller that
# has a kubernetes.io/tls-acme=true annotation

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Setup namespace
kubectl apply -f "${DIR}/00-namespace.yaml"
# ConfigMap, used by kube-lego
kubectl apply -f "${DIR}/configmap.yaml"
# Deployment
kubectl apply -f "${DIR}/deployment.yaml"
