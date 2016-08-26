# Deployment

The app is currently deployed on the Google Cloud using the Google Container Engine, [Kubernetes](http://kubernetes.io/).

The deployment of the elasticsearch container to the deployment pod is heavily inspired by the following guide
https://github.com/kubernetes/kubernetes/tree/release-1.2/examples/elasticsearch

Creating the cluster on the Google Cloud requires the following components:

## elasticsearch

- A persistent disk for the elasticsearch index, running `gcloud compute disks create --size=10GB --zone=europe-west1-b es-disk`

- A [replication controller](http://kubernetes.io/docs/user-guide/replication-controller/#what-is-a-replication-controller) of the elasticsearch container , running `kubectl create -f deployment/elasticsearch-rc.yaml`

- A [service](http://kubernetes.io/docs/user-guide/services/), running `kubectl create -f deployment/elasticsearch-service.yaml`

## Mongo DB

- A persistent disk for the elasticsearch index, running `gcloud compute disks create --size=10GB --zone=europe-west1-b mongo-disk`

- A [replication controller](http://kubernetes.io/docs/user-guide/replication-controller/#what-is-a-replication-controller) of the mongo container , running `kubectl create -f deployment/mongo-rc.yaml`

- A [service](http://kubernetes.io/docs/user-guide/services/), running `kubectl create -f deployment/mongo-service.yaml`

## Frontend

- A [deployment](http://kubernetes.io/docs/user-guide/deployments/#what-is-a-deployment) of the frontend , running `kubectl create -f deployment/frontend-deployment.yaml`

- A LoadBalancer [service](http://kubernetes.io/docs/user-guide/services/), running `kubectl create -f deployment/frontend-service.yaml`

## Updating the deployment

Make changes to the deployment/deployment.yaml or another .yaml file in the directory and use `kubectl replace -f deployment/frontend-deployment.yaml` to push the update to the Google cloud infrastructure.
