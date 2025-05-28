/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4285667772")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = driving_school.id || @request.auth.collectionName = \"students\" && @request.auth.driving_school.id = driving_school.id\n",
    "viewRule": "@request.auth.id = driving_school.id || @request.auth.collectionName = \"students\" && @request.auth.driving_school.id = driving_school.id\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4285667772")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = driving_school.id || @request.auth.id = driving_school.students_via_driving_school.id",
    "viewRule": "@request.auth.id = driving_school.id || @request.auth.id = driving_school.students_via_driving_school.id"
  }, collection)

  return app.save(collection)
})
