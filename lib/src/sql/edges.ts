/**
 * I'm not sure if I give here enaugh informations...
 */

import { mightbespace } from "./comment.ts";
import { thing } from "./thing.ts";
import { table, tables } from "./table.ts";
import { alt, char, map, ParserFn, tuple } from "./_base.ts";
import { dir } from "./dir.ts";

const any = map(char('?'), {
  type: 'tables',
  value: '#DEFAULT#'
})

const one = table
const customParser = tuple(char('('), mightbespace, alt(any, tables), mightbespace, char(')'))
const custom: ParserFn = (sql, offset) => {
  const res = customParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'tables',
    value: res.sub![3],
    position: res.position,
    length: res.length,
  }

  return res
}

const simpel = alt(any, one)

const edgesParser = tuple(thing, dir, alt(simpel, custom))
export const edges: ParserFn = (sql, offset) => {
  const res = edgesParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'Edges',
    value: {
      dir: res.sub![1].data,
      from: res.sub![0].data,
      what: res.sub![2].data,
    },
    position: res.position,
    length: res.length,
  }

  return res
}
