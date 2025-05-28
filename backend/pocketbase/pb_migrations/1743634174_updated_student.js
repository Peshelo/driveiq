/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // remove field
  collection.fields.removeById("json1304013603")

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_390383752",
    "hidden": false,
    "id": "relation2424909936",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "test_scores",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json1304013603",
    "maxSize": 0,
    "name": "past_tests",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("relation2424909936")

  return app.save(collection)
})
