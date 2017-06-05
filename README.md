# Collections Online

Historically the webapp built on top of the [Canto Cumulus](http://www.canto.com/)
web service, [Canto Integration Platform (CIP)](http://cumulus.natmus.dk/CIP/doc/index.html).
But everything related to this particular asset management system has been
wrapped in abstractions, which is why Collections Online, with some
customization, can be used with any modern DAMS that exposes an HTTP (RESTful) web-service.

The webapp is built using [node.js](http://nodejs.org/), [Express](http://expressjs.com/),
[pug](http://pugjs.org), and [elasticsearch](http://www.elasticsearch.org/) - if
no seperate document index exists. Most of the front-end stuff is using jQuery
for performing auto suggestion and UI updates. It is using the existing
[cip.js](https://github.com/NationalMuseumofDenmark/cip.js) implementation for querying the CIP.

The solution is built by [Headnet ApS](http://www.headnet.dk) and
[Socialsquare ApS](http://socialsquare.dk).
Licensed under [LGPL v3](https://www.gnu.org/licenses/lgpl.html).

![Screenshot](misc/screenshot.png)

## How to setup

First ensure that you have a running version of Node.js (and the NPM tool)
(the current code has been tested on node v.7.2).

Consider getting [elasticsearch](http://www.elasticsearch.org/) as well.
If you're on a mac it's easiest to install elasticsearch using homebrew which
installs to `/usr/local/Cellar/elasticsearch/`.

You should not try to setup the project, directly from this repository.
Start from the repository of a [customization](./docs/CUSTOMIZATIONS.md), to
which this repository should be a dependency.

## Changing the layout of an assets landing page

Have a look at the docs for [layout sections](./docs/LAYOUT-SECTIONS.md).

## Bugs

In case you find bugs please open [an issue](https://github.com/NationalMuseumofDenmark/natmus-samlinger/issues).

## Contribute

Please fork the repository into your own github account and create a pull request whenever you are done with
your changes. Ideally, you should rebase your branch before creating the pull request in case of upstream changes.

### Linting and coding styles

From 2016 and going forward the development team has been using the following
tools for linting and aligning coding styles:

* jscs (for the Atom Editor the linter-jscs can be used)
