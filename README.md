# kbh-billeder

This is the configuration/setup for the kbhbilleder.dk webapp built on top of
the Canto Cumulus webservice, Canto Integration Platform.

The shared core of this project is found at
http://github.com/collections-online/collections-online

## Setting up a production environment

### Clone the repository

```
git clone https://github.com/CopenhagenCityArchives/kbh-billeder.git
```

### Install Elasticsearch 2.3 or greater

Follow the guide on https://www.elastic.co/guide/en/elasticsearch/reference/2.3/setup-repositories.html, executing

```
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
sudo apt-get update && sudo apt-get install elasticsearch
```

### Run the indexing routines in all-mode

```
npm run-script index all
```


### Start the app

```
npm start
```

## Setting up the development environment

### Start elasticsearch as a service

```
sudo /etc/init.d/elasticsearch start
```

### Create a .env file with environment variables

### Set up symbolic linking between this and a Collections Online module

After cloning the Collections Online repository to your local environment
navigate to the git repository and prepare the module for linking by running

```
npm link
```

Then, in this repository run

```
npm link collections-online
```
