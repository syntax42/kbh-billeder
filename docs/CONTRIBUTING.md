# Contributing

To hit the ground running when developing on this project, it helps to
familiarize yourself with:
- [Node.js](https://nodejs.org/en/docs/)
- [Express](http://expressjs.com/en/api.html)
- [Collections Online](https://github.com/CopenhagenCityArchives/collections-online)

Read more about contributing to a collections online customization within the
[collections-online](https://github.com/CopenhagenCityArchives/collections-online/blob/testing/docs/CONTRIBUTING.md) docs.

When contributing to the master branch of this repository, commit changes on the
testing branch of the CopenhagenCityArchives' fork of collections-online.

When the contributions are ready for production, merge the testing branch of the
collections-online fork, into the master branch of the repository and merge the
beta branch into the production branch of this repository.

When pushing either the master og production branch of this repository, a build
will initiate on [CircleCI](https://circleci.com/gh/CopenhagenCityArchives/kbh-billeder)
which will publish the changes on http://beta.kbhbilleder.dk/ or
http://www.kbhbilleder.dk/ respectively.
