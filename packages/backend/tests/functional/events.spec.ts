import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import Event from '#models/event'

test.group('Events resource', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('index returns all events', async ({ client, assert }) => {
    await Event.create({
      title: 'Math class',
      type: 'school',
      startDate: DateTime.fromISO('2026-01-05'),
      endDate: DateTime.fromISO('2026-01-09'),
    })

    const response = await client.get('/events')
    const events = response.body() as unknown[]

    response.assertStatus(200)
    assert.lengthOf(events, 1)
  })

  test('store creates a new event', async ({ client, assert }) => {
    const response = await client.post('/events').json({
      title: 'Company sprint',
      type: 'company',
      startDate: '2026-02-02',
      endDate: '2026-02-06',
    })

    response.assertStatus(200)
    response.assertBodyContains({ title: 'Company sprint', type: 'company' })

    const created = response.body() as { id: number }
    const event = await Event.findOrFail(created.id)
    assert.equal(event.title, 'Company sprint')
  })

  test('store rejects a type outside the enum', async ({ client }) => {
    const response = await client.post('/events').json({
      title: 'Broken event',
      type: 'not-a-type',
      startDate: '2026-02-02',
      endDate: '2026-02-06',
    })

    response.assertStatus(422)
  })

  test('store rejects a missing title', async ({ client }) => {
    const response = await client.post('/events').json({
      type: 'school',
      startDate: '2026-02-02',
      endDate: '2026-02-06',
    })

    response.assertStatus(422)
  })

  test('show returns a single event', async ({ client }) => {
    const event = await Event.create({
      title: 'Exam day',
      type: 'exam',
      startDate: DateTime.fromISO('2026-03-01'),
      endDate: DateTime.fromISO('2026-03-01'),
    })

    const response = await client.get(`/events/${event.id}`)

    response.assertStatus(200)
    response.assertBodyContains({ id: event.id, title: 'Exam day' })
  })

  test('show returns 404 for a missing event', async ({ client }) => {
    const response = await client.get('/events/999999')

    response.assertStatus(404)
  })

  test('update modifies an existing event', async ({ client }) => {
    const event = await Event.create({
      title: 'Holiday',
      type: 'holiday',
      startDate: DateTime.fromISO('2026-04-01'),
      endDate: DateTime.fromISO('2026-04-10'),
    })

    const response = await client.put(`/events/${event.id}`).json({
      title: 'Updated holiday',
      type: 'holiday',
      startDate: '2026-04-01',
      endDate: '2026-04-12',
    })

    response.assertStatus(200)
    response.assertBodyContains({ title: 'Updated holiday' })
  })

  test('update returns 404 for a missing event', async ({ client }) => {
    const response = await client.put('/events/999999').json({
      title: 'Updated holiday',
      type: 'holiday',
      startDate: '2026-04-01',
      endDate: '2026-04-12',
    })

    response.assertStatus(404)
  })

  test('destroy removes an event', async ({ client }) => {
    const event = await Event.create({
      title: 'Other event',
      type: 'other',
      startDate: DateTime.fromISO('2026-05-01'),
      endDate: DateTime.fromISO('2026-05-01'),
    })

    const deleteResponse = await client.delete(`/events/${event.id}`)
    deleteResponse.assertStatus(200)

    const showResponse = await client.get(`/events/${event.id}`)
    showResponse.assertStatus(404)
  })

  test('destroy returns 404 for a missing event', async ({ client }) => {
    const response = await client.delete('/events/999999')

    response.assertStatus(404)
  })
})
