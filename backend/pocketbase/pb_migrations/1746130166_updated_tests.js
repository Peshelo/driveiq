/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4285667772")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = driving_school.id",
    "deleteRule": "@request.auth.id = driving_school.id",
    "listRule": "@request.auth.id = driving_school.id || @request.auth.id = driving_school.students_via_driving_school.id",
    "updateRule": "@request.auth.id = driving_school.id",
    "viewRule": "@request.auth.id = driving_school.id || @request.auth.id = driving_school.students_via_driving_school.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4285667772")

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
