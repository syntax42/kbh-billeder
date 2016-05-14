#!/bin/bash
echo "Deploying to the staging server"
GCLOUD_PROJECT="kbh-billeder"
# Authenticating following the guide on https://circleci.com/docs/google-auth/
# Decoding the gcloud service key
echo $GCLOUD_SERVICE_KEY | base64 --decode > ${HOME}/gcloud-service-key.json
# Upgrade the gcloud tool
sudo gcloud --quiet components update
# Authenticating the gcloud client
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
# Set the gcloud config
gcloud config set project $GCLOUD_PROJECT
gcloud config set compute/region europe-west1
gcloud config set compute/zone europe-west1-d
