# Deployment

The app is currently deployed on the Google Cloud using the Google Container Engine, [Kubernetes](http://kubernetes.io/).

The deployment of the elasticsearch container to the deployment pod is heavily inspired by the following guide
https://github.com/kubernetes/kubernetes/tree/release-1.2/examples/elasticsearch

Creating the cluster on the Google Cloud requires the following components:

- A persistent disk for the elasticsearch index, running `gcloud compute disks create --size=10GB --zone=europe-west1-b es-disk`

- A [service](http://kubernetes.io/docs/user-guide/services/), running `kubectl create -f deployment/service.yaml`

- A [deployment](http://kubernetes.io/docs/user-guide/deployments/#what-is-a-deployment) of the frontend and elasticsearch containers , running `kubectl create -f deployment/deployment.yaml`

## Updating the deployment

Make changes to the deployment/deployment.yaml or another .yaml file in the directory and use `kubectl replace -f deployment/deployment.yaml` to push the update to the Google cloud infrastructure.
