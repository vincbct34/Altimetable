import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { eventTypes, eventValidator } from '#validators/event'

test.group('Event validator', () => {
  test('accepts every configured event type', async ({ assert }) => {
    for (const type of eventTypes) {
      const [error, result] = await eventValidator.tryValidate({
        title: 'Some event',
        type,
        startDate: '2026-01-01',
        endDate: '2026-01-05',
      })

      assert.isNull(error)
      assert.equal(result?.type, type)
      assert.isTrue(result?.startDate instanceof DateTime)
      assert.isTrue(result?.endDate instanceof DateTime)
    }
  })

  test('rejects a type outside the enum', async ({ assert }) => {
    const [error, result] = await eventValidator.tryValidate({
      title: 'Some event',
      type: 'not-a-real-type',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
    })

    assert.isNull(result)
    assert.exists(error)
  })

  test('rejects a missing title', async ({ assert }) => {
    const [error, result] = await eventValidator.tryValidate({
      type: 'school',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
    })

    assert.isNull(result)
    assert.exists(error)
  })

  test('rejects an unparsable date', async ({ assert }) => {
    const [error, result] = await eventValidator.tryValidate({
      title: 'Some event',
      type: 'school',
      startDate: 'not-a-date',
      endDate: '2026-01-05',
    })

    assert.isNull(result)
    assert.exists(error)
  })
})
