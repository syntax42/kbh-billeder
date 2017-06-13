# Kbh-billeder

[![CircleCI](https://circleci.com/gh/CopenhagenCityArchives/kbh-billeder.svg?style=svg)](https://circleci.com/gh/CopenhagenCityArchives/kbh-billeder)

This is the configuration/setup for the kbhbilleder.dk webapp built on top of
the Canto Cumulus webservice, Canto Integration Platform.

The shared core of this project is found at
http://github.com/collections-online/collections-online

---

## Deploying the app

See [deployment/README.md](deployment/README.md)

## Developing the app

## Install NVM for managing the node versions

Follow the guide on https://github.com/creationix/nvm

## Setting up the development environment

Clone the module from GitHub

```
git@github.com:CopenhagenCityArchives/kbh-billeder.git
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

For mac you might need to install manually:
```
xcode-select --install
brew install pkgconfig
brew install pixman
brew install libjpeg
brew install giflib
brew install cairo
```

### Get dependencies up and running
We're relying on Elasticsearch 2.3 <= 2.4.4 and MongoDB greater than 2.4. You can install them via docker or
manually but we recommend using docker.

#### With docker
First step is to [install](https://docs.docker.com/compose/install/) `docker` and `docker-compose`.

Next you should make sure to add your user to the `docker` group so you don't have to run commands as sudo. A guide can be found [here](https://askubuntu.com/questions/477551/how-can-i-use-docker-without-sudo).

Now you can start Elasticsearch and Mongo in their own containers simply by running `docker-compose up`.

### Create a .env file with environment variables

    CIP_USERNAME="..."
    CIP_PASSWORD="..."
    CLOUDINARY_URL=cloudinary://..:..@kbh-billeder
    GOOGLE_API_KEY="..."
    GOOGLE_UNRESTRICTED_API_KEY="..."

    AUTH0_DOMAIN="..."
    AUTH0_CLIENT_ID="..."
    AUTH0_CLIENT_SECRET="..."
    AUTH0_CALLBACK_URL="http://.../auth/callback"

    MAILGUN_API_KEY="..."

    # Using docker-compose these are the correct addresses.
    ES_HOST="http://localhost:9200/"
    MONGO_CONNECTION=mongodb://localhost:27017/kbh-billeder


### Running the app

Now we're ready to start developing!

```
npm start:dev
```

This command will start the server, boot up your dependencies, start a gulp watch and restart the server anytime a change happens in any of the project folders.

Note: quitting the process doesn't shut down the docker containers. For that you must run `docker-compose down`.

### Run the indexing routines in all-mode
If you're running elasticsearch locally, it will be of course be empty when you first start it. To fill it up with some assets you can run.


```
npm run index all
```

You can cancel at any time, but it's recommended to run through the whole thing.

### Set up symbolic linking between this module and the other Collections Online modules

When developing both on this module and collections online at the same time it
might help you to link the two modules, so you don't have to push/pull constantly.

We're recommend the following project structure to take advantage of `nodemon`s reloading:

    kbh-billeder-project
      | kbh-billeder
      | collections-online
      | collections-online-cumulus

After cloning the [Collections Online](https://github.com/CopenhagenCityArchives/collections-online) and [Collections Online Cumulus](https://github.com/collections-online/collections-online-cumulus)
repositories to your local environment navigate to the repositories and prepare
the modules for linking by running the following. This installs the module's dependencies as well.

```
npm link
```

Then, in the kbh-billeder repository run

```
npm link collections-online
npm link collections-online-cumulus
```

To simplify this, we could consider using [Lerna](https://github.com/lerna/lerna)

## Connecting to elasticsearch (when deployed)

Install the kubectl commandline tool

```
gcloud components install kubectl
```

Get the kubenetes credentials for the cluster

```
gcloud container clusters get-credentials kbh-billeder-staging-cluster
```

Get the name of the pods using (note that this might change if server is e.g.
reset).

```
kubectl get pods
```

Note the name of the elasticsearch pod (in this case vem8u).

To connect to the production elasticsearch server, use kubectl to create a
port forwarding. After which the production elasticsearch server will be
available on http://localhost:9200/

```
kubectl port-forward elasticsearch-vem8u 9200:9200
```

The following npm command takes care of running the app with the production index.

```
npm start:dev:es
```
