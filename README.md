# Kbh-billeder

This is the configuration/setup for the kbhbilleder.dk webapp built on top of
the Canto Cumulus webservice, Canto Integration Platform.

The shared core of this project is found at
http://github.com/collections-online/collections-online

---

## Deploying the app

See [deployment/README.md](deployment/README.md)

## Get dependencies up and running

### Install Elasticsearch 2.3 or greater

Follow the guide on https://www.elastic.co/guide/en/elasticsearch/reference/2.3/setup-repositories.html

##### Linux

```
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
sudo apt-get update && sudo apt-get install elasticsearch
```

##### Mac

Install using [homebrew](http://brew.sh)

```
brew install elasticsearch
```

### Install MongoDB 2.4 or greater

##### Linux

Follow the guide on https://docs.mongodb.com/manual/administration/install-on-linux/

##### Mac

Install using [homebrew](http://brew.sh)

```
brew install mongodb
```

### Install NVM for managing the node versions

Follow the guide on https://github.com/creationix/nvm

## Setting up the development environment

Clone the module from GitHub

```
git@github.com:collections-online/collections-online.git
```

Make sure you use the correct version of node.

```
nvm use
```

Install the node module and it's dependencies. This runs a gulp build too, which
runs a bower install as well.

```
npm install
```

### Install Cairo (needed for the npm canvas pkg used for watermarking)

Instructions on: https://www.npmjs.com/package/canvas

For mac you might need to brew install cairo separately (check with `brew ls`) and this might also help you https://github.com/Automattic/node-canvas/issues/649#issuecomment-149039524
```
xcode-select --install
brew install pkgconfig
brew install pixman
brew install libjpeg
brew install giflib
brew install cairo
```

### Start elasticsearch

You might consider connecting directly to the production elasticsearch server
instead. See how in another section below.

##### Linux (as a service)

```
sudo /etc/init.d/elasticsearch start
```

##### Mac

```
elasticsearch
```

### Create a .env file with environment variables

    CIP_USERNAME="..."
    CIP_PASSWORD="..."
    ES_HOST="http://localhost:9200/"
    CLOUDINARY_URL=cloudinary://..:..@kbh-billeder


### Run the indexing routines in all-mode

```
npm run index all
```

### Start the app

```
npm start
```

### Start a gulp watch to recompile static assets when they change

```
npm run gulp watch
```

### Set up symbolic linking between this module and the Collections Online module

When developing both on this module and collections online at the same time it
might help you to link the two moduls, so you don't have to push/pull constantly.

After cloning the [Collections Online](https://github.com/collections-online/collections-online)
repository to your local environment navigate to the git repository and prepare
the module for linking (this installs collections onlines dependencies).

```
npm link
```

Then, in the kbh-billeder repository run

```
npm link collections-online
```

## Connecting to elasticsearch (when deployed)

Install the kubectl commandline tool

```
gcloud components install kubectl
```

Get the kubenetes credentials for the cluster

```
gcloud container clusters get-credentials kbh-billeder-staging-cluster
```

To connect to the production elasticsearch server, use kubectl to create a
port forwarding. After which the production elasticsearch server will be
available on http://localhost:9201/

```
kubectl port-forward elasticsearch-ad1w8 9201:9200
```

Node the elasticsearch pod might have changed name - get the name of the pods
using

```
kubectl get pods
```

## Subsequent runs

Open 3 terminal windows in the project folder and run

```
kubectl port-forward elasticsearch-ad1w8 9201:9200
```

```
npm run gulp
```

```
npm start
```
