/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select4081094964",
    "maxSelect": 1,
    "name": "primary_color",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "blue",
      "red",
      "green",
      "white",
      "gray",
      "yellow",
      "orange",
      "slate"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select2062327183",
    "maxSelect": 1,
    "name": "secondary_color",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "blue",
      "red",
      "green",
      "white",
      "gray",
      "yellow",
      "orange",
      "slate"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select4081094964")

  // remove field
  collection.fields.removeById("select2062327183")

  return app.save(collection)
})
