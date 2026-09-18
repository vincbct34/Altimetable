/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  events: {
    index: typeof routes['events.index']
    store: typeof routes['events.store']
    show: typeof routes['events.show']
    update: typeof routes['events.update']
    destroy: typeof routes['events.destroy']
  }
}
