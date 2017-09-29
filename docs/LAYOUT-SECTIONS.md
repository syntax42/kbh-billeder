# Layout sections

It specifies a list of sections.

    {
      "sections": [ ... ]
    }

Each section has:
- A `title`,
- A table of `rows`
- An optional CSS `class` attribute, which is added to the table element.


    {
      ...,
      "sections": [{
        "title": "The place section",
        "class": "place",
        "rows": [ ... ]
      }]
    }

## Rows

Each of the rows has:
- `title` written as a label before the value
- Optional `type` - which determines how the value is presented (default: simple)

Rows that are rendered equally if supplied metadata or not, is not shown.
If all rows are not shown, the section as a whole is not shown either.

Depending on the value of type, one of more fields are required.
All row types maps 1-to-1 with a template in the
`/app/views/includes/asset-row-types/` directory.
Adding a new template to this directory enables a new row type.

### If the rows `type` is `simple`

The `template` will determine how the value is rendered, all fields from the
assets metadata, as well as a few helper functions are available as locals.
Any valid [pug](https://pugjs.org/) template can go into the this field.

    {
      "title": "The place section",
      "class": "place",
      "rows': [{
        "title': "The value of foo or bar",
        "type": "simple",
        "template": "| #{foo||bar}"
      }]
    }

### If the rows `type` is `date-interval`

This type can be used to show date intervals - if the value of both ends of the
interval is equal, only the date in the beginning of the interval is shown.

The `fields` is an object with two values. The metadata field name of the
intervals start date as `from` and end date as `to`.

    {
      "title": "The place section",
      "rows": [{
        "title": "The value of a good date interval",
        "type": "simple",
        "fields": {
          "from": "good_start",
          "to": "good_end"
        }
      }]
    }

### If the rows `type` is `map-coordinates`

This type can be used to show Google coordinates as text followed by a map.

The `fields` is an object with two values. The metadata field name of the
coordinate `latitude` and `longitude`.

    {
      "title": "The place section",
      "rows": [{
        "title": "Map coordinates",
        "type": "map-coordinates",
        "fields": {
          "latitude": "latitude",
          "longitude": "longitude"
        }
      }]
    }

If the assetLayout is given a truly value in it's `showGeotagging` options
object a pen will be shown besides the coordinates, which might be used to
initiate a crowd sourcing of the coordinate pair.
