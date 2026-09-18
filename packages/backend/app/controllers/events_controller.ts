import type { HttpContext } from '@adonisjs/core/http'
import { eventValidator } from '#validators/event'
import Event from '#models/event'

export default class EventsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return Event.all()
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(eventValidator)
    return Event.create(payload)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return Event.findOrFail(params.id)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const event = await Event.findOrFail(params.id)
    const payload = await request.validateUsing(eventValidator)
    event.merge(payload)
    await event.save()
    return event
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const event = await Event.findOrFail(params.id)
    await event.delete()
  }
}
