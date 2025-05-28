/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1769977620",
    "maxSelect": 1,
    "name": "license_class",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Class 1 (Motorcycles)",
      "Class 2 (Light Vehicles)",
      "Class 3 (Heavy Vehicles)",
      "Class 4 (Passenger Vehicles)"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // remove field
  collection.fields.removeById("select1769977620")

  return app.save(collection)
})
