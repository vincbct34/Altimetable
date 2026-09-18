/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'events.index': {
    methods: ["GET","HEAD"],
    pattern: '/events',
    tokens: [{"old":"/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['events.index']['types'],
  },
  'events.store': {
    methods: ["POST"],
    pattern: '/events',
    tokens: [{"old":"/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['events.store']['types'],
  },
  'events.show': {
    methods: ["GET","HEAD"],
    pattern: '/events/:id',
    tokens: [{"old":"/events/:id","type":0,"val":"events","end":""},{"old":"/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.show']['types'],
  },
  'events.update': {
    methods: ["PUT","PATCH"],
    pattern: '/events/:id',
    tokens: [{"old":"/events/:id","type":0,"val":"events","end":""},{"old":"/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.update']['types'],
  },
  'events.destroy': {
    methods: ["DELETE"],
    pattern: '/events/:id',
    tokens: [{"old":"/events/:id","type":0,"val":"events","end":""},{"old":"/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
