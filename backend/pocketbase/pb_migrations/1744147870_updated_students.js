/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "select3343321666",
    "maxSelect": 1,
    "name": "gender",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "MALE",
      "FEMALE"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // remove field
  collection.fields.removeById("select3343321666")

  return app.save(collection)
})
