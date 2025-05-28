/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3831051756")

  // remove field
  collection.fields.removeById("relation2758380978")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3831051756")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_644927705",
    "hidden": false,
    "id": "relation2758380978",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "students",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
