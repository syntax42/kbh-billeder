#!/bin/bash

# Exit on any error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# A disk for the elasticsearch pod
gcloud compute disks create $ES_DISK_NAME --size=10GB --zone=europe-west1-b --project kbh-billeder
# A disk for the mongodb pod
gcloud compute disks create $MONGO_DISK_NAME --size=10GB --zone=europe-west1-b --project kbh-billeder

# Create a production namespace
ktmpl -p NAMESPACE $NAMESPACE $DIR/namespace.yaml | kubectl create -f -

# Create a service for elasticsearch
kubectl create -n $NAMESPACE -f $DIR/elasticsearch-service.yaml
# Create the replication controller for the mongo db
ktmpl -p ES_DISK_NAME $ES_DISK_NAME $DIR/elasticsearch-rc.yaml | kubectl create -n $NAMESPACE -f -

# Create a service for mongo
kubectl create -n $NAMESPACE -f $DIR/mongo-service.yaml
# Create the replication controller for the mongo db
ktmpl -p MONGO_DISK_NAME $MONGO_DISK_NAME $DIR/mongo-rc.yaml | kubectl create -n $NAMESPACE -f -

# Create a service for the frontend(s)
ktmpl -p FRONTEND_PUBLIC_IP $FRONTEND_PUBLIC_IP $DIR/frontend-service.yaml | kubectl create -n $NAMESPACE -f -
ktmpl -p BRANCH $BRANCH -p FRONTEND_PUBLIC_HOSTNAME $FRONTEND_PUBLIC_HOSTNAME $DIR/frontend-deployment.yaml | kubectl create -n $NAMESPACE -f -

# Setup frontend ingress
ktmpl \
  -p FRONTEND_PUBLIC_IP_NAME $FRONTEND_PUBLIC_IP_NAME \
  -p FRONTEND_PUBLIC_HOSTNAME $FRONTEND_PUBLIC_HOSTNAME \
  $DIR/frontend-ingress.yaml \
  | kubectl apply -n $NAMESPACE -f -
