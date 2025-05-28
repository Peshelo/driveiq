/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select3671935525",
    "maxSelect": 1,
    "name": "answer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "option_a",
      "option_b",
      "option_c"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select3671935525",
    "maxSelect": 1,
    "name": "answer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "a",
      "b",
      "c"
    ]
  }))

  return app.save(collection)
})
