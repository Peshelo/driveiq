/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

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
      "TRAFFIC_LAWS",
      "SAFETY",
      "VEHICLE_CONTROL",
      "EMERGENCIES"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

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
})
