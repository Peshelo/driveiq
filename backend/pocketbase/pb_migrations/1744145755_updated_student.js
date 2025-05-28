/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "file376926767",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "avatar",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "date1089581607",
    "max": "",
    "min": "",
    "name": "date_of_birth",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "json2424909936",
    "maxSize": 0,
    "name": "test_scores",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "bool458715613",
    "name": "is_active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // remove field
  collection.fields.removeById("file376926767")

  // remove field
  collection.fields.removeById("date1089581607")

  // remove field
  collection.fields.removeById("json2424909936")

  // remove field
  collection.fields.removeById("bool458715613")

  return app.save(collection)
})
