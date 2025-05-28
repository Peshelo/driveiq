/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2284106510",
    "max": 0,
    "min": 0,
    "name": "explanation",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select3671935525",
    "maxSelect": 1,
    "name": "correct_answer",
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

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select105650625",
    "maxSelect": 1,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "ROAD_SIGNS",
      "SAFETY",
      "TRAFFIC_LAWS",
      "OTHER"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // remove field
  collection.fields.removeById("text2284106510")

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

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select105650625",
    "maxSelect": 1,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "ROAD SIGNS",
      "ROAD SAFETY",
      "MANUAL GEARS",
      "LAW",
      "OTHER"
    ]
  }))

  return app.save(collection)
})
