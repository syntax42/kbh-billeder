#!/bin/bash
# Push the frontend images to
$GCLOUD docker -- push $IMAGE_PATH
# Patch the frontend deployment, in the correct namespace
kubectl patch deployment frontend -n $NAMESPACE -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","image":"'$IMAGE_PATH'"}]}}}}'
