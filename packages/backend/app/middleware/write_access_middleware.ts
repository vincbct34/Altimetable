import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class WriteAccessMiddleware {
  handle({ request, response }: HttpContext, next: NextFn) {
    const header = request.header('authorization') ?? ''
    const token = header.replace(/^Bearer\s+/i, '')

    if (!token || token !== env.get('WRITE_ACCESS_TOKEN').release()) {
      return response.unauthorized({ error: 'Invalid or missing write access token' })
    }

    return next()
  }
}
