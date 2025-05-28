/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "id = @request.auth.id || role = \"SUPER_ADMIN\"",
    "deleteRule": "id = @request.auth.id || role = \"SUPER_ADMIN\"",
    "listRule": "id = @request.auth.id || role = \"SUPER_ADMIN\"",
    "updateRule": "id = @request.auth.id || role = \"SUPER_ADMIN\"",
    "viewRule": "id = @request.auth.id || role = \"SUPER_ADMIN\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "id = @request.auth.id",
    "listRule": "id = @request.auth.id",
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
