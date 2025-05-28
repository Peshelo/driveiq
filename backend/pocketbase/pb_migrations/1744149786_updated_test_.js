/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4285667772")

  // remove field
  collection.fields.removeById("text236625275")

  // remove field
  collection.fields.removeById("text988023068")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number236625275",
    "max": null,
    "min": null,
    "name": "passing_score",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number988023068",
    "max": null,
    "min": null,
    "name": "time_limit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4285667772")

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text236625275",
    "max": 0,
    "min": 0,
    "name": "passing_score",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text988023068",
    "max": 0,
    "min": 0,
    "name": "time_limit",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("number236625275")

  // remove field
  collection.fields.removeById("number988023068")

  return app.save(collection)
})
