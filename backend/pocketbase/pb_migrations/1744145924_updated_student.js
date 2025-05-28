/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_1857285970` ON `students` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_1857285970` ON `students` (`email`) WHERE `email` != ''"
    ],
    "name": "students"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1857285970")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_1857285970` ON `student` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_1857285970` ON `student` (`email`) WHERE `email` != ''"
    ],
    "name": "student"
  }, collection)

  return app.save(collection)
})
