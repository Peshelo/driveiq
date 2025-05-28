/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id) ||\n(@request.auth.collectionName = \"students\" && @request.auth.driving_school.id = driving_school.id)\n",
    "viewRule": "(@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id) ||\n(@request.auth.collectionName = \"students\" && @request.auth.driving_school.id = driving_school.id)\n"
  }, collection)

  return app.save(collection)
})
