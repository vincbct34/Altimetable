import vine from '@vinejs/vine'

export const eventTypes = ['school', 'company', 'holiday', 'exam', 'other'] as const

export type EventType = (typeof eventTypes)[number]

export const eventValidator = vine.compile(
  vine.object({
    title: vine.string(),
    type: vine.enum(eventTypes),
    startDate: vine.date(),
    endDate: vine.date(),
  })
)
