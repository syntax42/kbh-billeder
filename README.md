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

### Install node modules

In this repository run

```
npm install
```

### Fetch the relevant bower components

First install bower globally

```
npm install -g bower
```

Install bower components

```
cd node_modules/collections-online/ && bower install
```

### Run gulp to build CSS from SCSS and other generated statics

First install gulp globally

```
npm install -g gulp
```

Then run gulp

```
gulp
```

### Install Elasticsearch 2.3 or greater

Follow the guide on https://www.elastic.co/guide/en/elasticsearch/reference/2.3/setup-repositories.html, executing

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

##### Mac

Install using [homebrew](http://brew.sh)

brew install mongodb

### Run the indexing routines in all-mode

```
npm run index all
```


### Start the app

```
npm start
```

## Setting up the development environment

### Start elasticsearch as a service

##### Linux

```
sudo /etc/init.d/elasticsearch start
```

##### Mac

Where 2.3.2 is your version number

```
/usr/local/Cellar/elasticsearch/2.3.2/bin/elasticsearch
```

### Create a .env file with environment variables

### Set up symbolic linking between this and a Collections Online module

After cloning the [Collections Online](https://github.com/collections-online/collections-online) repository to your local environment
navigate to the git repository and install the node modules

```
npm install
```

When done, prepare the module for linking by running

```
npm link
```

Then, in the kbh-billeder repository run

```
npm link collections-online
```
