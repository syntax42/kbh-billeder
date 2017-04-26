# collections-online-cumulus

A module that enables collections-online to index and display assets from the
Canto Cumulus™ DAMS

# Indexing assets from Cumulus to Collections Online's Elasticsearch index

The current state of indexing is executed from a "customization" that first
initializes Collection Online and then calls the `run`-method of
collections-online's `indexing.js`.
