plug-inThis file is a placeholder for an explanation of plug-ins in the context of
collections-online.

# Plug-ins

## Why plug-ins?

Some decisions are arbitrary when writing something like Collections Online.
A specific functionality can be implemented in many ways, and which is the right
depends on context. For this the project uses plug-ins.

Plug-ins can be registered for later use by the rest of collections-online or for the
code in the customization.

## Registering a plug-in

To register a plug-in, define an object with the following keys:

- **type**

  What type of plug-in is this? Every type has its own interface which needs to
  be coordinated with any code using the plug-in.

- **module**

  The module that the plug-in will return when used.

- **initialize** (optional)

  A function called when collections-online initializes. It's given two
  values as argument the Express `app`, the collections-online `config` object.

- **registerRoutes** (optional)

  A function which is called when Collections Online wants the plug-in to
  register any routes that it may have. This method is called in the order that
  plug-ins are registered and before any other routes are registered.
  This method is given the Express `app` as its single argument.

Then, from somewhere in the initialization of your projects customization call
the `register` function on the `collections-online/plugins`.

    const myPlugin = {
      type: ...,
      module: require(...),
      initialize: (app, config) => { ... },
      registerRoutes: (app) => { ... }
    }
    const plugins = require('collections-online/plugins');
    plugins.register(myPlugin);

To see examples of how to register plug-ins, browse the contents of the
`collections-online/plugins` directory and `collections-online/server.js:11-22`.

Don't forget to ask Collections Online (and other collections-online extensions)
to initialize it´s default plug-ins when initliazing your projects plug-ins:

    require('collections-online').registerPlugins();

## Using a plug-in

To use a plug-in, call the `getFirst` method on the `collections-online/plugins`
module.

As an example see the `lib/controllers/geo-tagging.js:7-11`

    const plugins = require('../../plugins');
    const geoTagController = plugins.getFirst('geo-tag-controller');
    if(!geoTagController) {
      throw new Error('Missing a geo-tag-controller plugin!');
    }

We get a handle to the plug-ins module, get the first plug-in with the type of
`geo-tag-controller` and then we assert that it's actually registered before
using it.

## Plug-ins currently used

The following plug-ins are used by Collections Online, and some only when the
corresponding "feature flag" is enabled in the customizations configuration.

All of the functions below return promises, if their behaviour is asynchronous,
if nothing other is mentioned explicitly.

- **cms**

    This type is used to define a content management system for things such as
    informative pages with links and images as well as management of menues to
    these pages, or similar. The interface expects no particular functions to be
    exported from a plug-in of this type.

- **document-service**

    This plug-in defines a way to search in documents containing metadata about
    each item in the digital collections that we are putting online.
    Historically ElasticSearch was "baked into" Collections Online, but now it
    supports other document services, which exposes (or can be mapped) to the
    same interface that the ElasticSearch JS SDK exposes. Collections Online
    specifically expects the following methods to be defined by a plug-in of this
    type:

    - [search](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search):
    Based on a query - filter, sort and potentially aggregate across facets of
    documents describing the items we want to get online.
    -  [count](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-count):
    Based on a search query, potentially filtering out result, get the number of results.
    - [getSource](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-getsource):
    To get the source of a single document, based on it's type and id.
    - [mget](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-mget):
    Get multiple sources at once, based on their ids and type.

- **geo-tag-controller**

  Plug-ins of this type saves geographical tags (i.e. coordinates from a pin
  dropped on a map) from volunteer contributors.

  - **save**: Saves the geographical information to whatever source system this
  plug-in wants to save to. It's called with a single object as argument, which
  has the following fields:
    - The `collection` alias of the document, to which the coordinates relate.
    - The `id` of the document, to which new coordinates are to be saved.
    - `latitude` of the new coordinates.
    - `longitude` of the new coordinates.
    - `heading` which is measured in degrees (clockwise) from cardinal direction
       North.
  - **updateIndex**: Updates the index (or prompts it to do so, itself) with the
  values that has just been saved to the source system.
    - The `collection` alias of the document just updated.
    - The `id` of the document just updated.

- **image-controller**

  This is a way for Collections Online to read the bytes of the media that some
  document of type asset, represents. A plug-in of this type exposes two
  methods that can be called to get a request object to the image provider,
  which will eventually be piped into the users HTTP response stream.

  - **proxyDownload**: Creates a request to download the asset in a particular
  size. It's given the `id` (which is the collection alias and nummeric id
  combined), as well as a `size` which is defined in the `downloadOptions`
  object on the configuration.

  - **proxyThumbnail**: Creates a requests to the thumbnail of an asset. It's
  given the `id` (which is the collection alias and nummeric id combined).

- **indexing-engine**

  Plug-ins of this type can transfer metadata about items from a source system to
  the index (i.e. document-service). The plug-in exposes a single function that
  takes a `state` object as an argument.

  Historically only a single indexing-engine existed, which transfers metadata
  about assets from Cumulus to an ElasticSearch index. See this for details on
  the fields on the `state` argument.

- **motif-tag-controller**

  Similarly to the geo-tag-controller plug-in, this type of plug-in saves motif
  tags (i.e. words about what a particular document is about) from volunteer
  contributors. If the document represents an image, this could be what is
  depicted on the image.

  - **save**: Saves the tag information to whatever source system this
  plug-in wants to save to. It's called with a single object as argument, which
  has the following fields:
    - The `collection` alias of the document, to which the coordinates relate.
    - The `id` of the document, to which new coordinates are to be saved.
    - `userTags` are all the tags that users have contributed so far.
    - `visionTags` are the tags which are generated from computer vision and
       which has not (yet) been removed by the users.
  - **updateIndex**: Updates the index (or prompts it to do so, itself) with the
  values that has just been saved to the source system.
    - The `collection` alias of the document just updated.
    - The `id` of the document just updated.
  - **typeaheadSuggestions**: Ask some source system for suggestions on tags
  that has already been used on other documents. It is given a single string as
  its argument, the text a user has typed and wants suggestions on.
