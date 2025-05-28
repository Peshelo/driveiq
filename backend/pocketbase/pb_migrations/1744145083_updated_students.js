/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // add field
  collection.fields.addAt(9, new Field({
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
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // remove field
  collection.fields.removeById("bool458715613")

  return app.save(collection)
})
