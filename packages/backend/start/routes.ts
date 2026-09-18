/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .resource('events', controllers.Events)
  .apiOnly()
  .middleware(['store', 'update', 'destroy'], middleware.writeAccess())
