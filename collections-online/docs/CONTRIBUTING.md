# Contributing

## Structure & repositories

At the time of writing, only two [customizations](./CUSTOMIZATIONS.md) of
collections-online is known to exist. In an attempt to speed up feature
development, versionering of the collections-online core component has not been
actively utilized.

Instead every deployment maintains their own fork of repositories to pin down
the version of the code running, and to push (potentially breaking) changes
without the need to coordinate these with other users of the core project.

## Linking NPM packages on a developers machine

When developing a customization and contributing code to the core of
Collections Online, it takes a long time if every change to the core needs to
be committed to git, pushed to GitHub and pulled from within the customization.

To get around this, use [NPM linking](https://docs.npmjs.com/cli/link):

1. Check out this repository (or a fork of it).
2. Run `npm link` to install dependencies and prepare for linking.
   This will create a symlink from your node intallations `/lib/node_modules/`
   folder.
3. Change directory to the customizations repository and run
   `npm link collections-online` to create a symlink from your custimizations
   `node_modules/collections-online` folder to the link created in the previous
   step.
