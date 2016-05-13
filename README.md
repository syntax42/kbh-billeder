# kbh-billeder

This is the configuration/setup for the kbhbilleder.dk webapp built on top of
the Canto Cumulus webservice, Canto Integration Platform.

The shared core of this project is found at
http://github.com/collections-online/collections-online

## Setting up the development environment

### Create a .env file with environment variables

### Set up symbolic linking between this and a Collections Online module

After cloning the Collections Online repository to your local environment
navigate to the git repository and prepare the module for linking by running

  ```npm link```

Then, in this repository run

  ```npm link collections-online```
