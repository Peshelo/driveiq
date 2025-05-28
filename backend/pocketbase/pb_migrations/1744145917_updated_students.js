/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // update collection data
  unmarshal({
    "name": "students_depricated"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_644927705")

  // update collection data
  unmarshal({
    "name": "students"
  }, collection)

  return app.save(collection)
})
