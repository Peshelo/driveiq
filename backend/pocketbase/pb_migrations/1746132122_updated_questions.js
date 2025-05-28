/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id\n",
    "deleteRule": "@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id\n",
    "listRule": "(@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id) ||\n(@request.auth.collectionName = \"students\" && @request.auth.driving_school.id = driving_school.id)\n",
    "updateRule": "@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id\n",
    "viewRule": "(@request.auth.collectionName = \"users\" && @request.auth.id = driving_school.id) ||\n(@request.auth.collectionName = \"students\" && @request.auth.driving_school.id = driving_school.id)\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
