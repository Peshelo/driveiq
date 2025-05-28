/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update collection data
  unmarshal({
    "name": "questions"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4139323735")

  // update collection data
  unmarshal({
    "name": "question"
  }, collection)

  return app.save(collection)
})
