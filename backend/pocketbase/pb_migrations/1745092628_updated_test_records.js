/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_390383752")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool1675235655",
    "name": "passed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_390383752")

  // remove field
  collection.fields.removeById("bool1675235655")

  return app.save(collection)
})
