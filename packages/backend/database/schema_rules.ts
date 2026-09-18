import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'
import { eventTypes } from '#validators/event'

const eventTypeUnion = eventTypes.map((type) => `'${type}'`).join(' | ')

export default {
  tables: {
    events: {
      columns: {
        type: { tsType: eventTypeUnion },
      },
    },
  },
} satisfies SchemaRules
