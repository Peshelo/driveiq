/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = driving_school.id || @request.auth.role = \"STUDENT\"",
    "viewRule": "@request.auth.id = driving_school.id || @request.auth.id = id || @request.auth.role = \"STUDENT\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = driving_school.id",
    "viewRule": "@request.auth.id = driving_school.id || @request.auth.id = id"
  }, collection)

  return app.save(collection)
})
