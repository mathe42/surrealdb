import { char, tuple, map, ParserFn, alt, tag_no_case, tag } from "./_base.ts";
import { ident as ending, number } from "./ending.ts";
import { ident } from "./ident.ts";
import { shouldbespace } from "./comment.ts";
import { value } from "./value/value.ts";
import { thing as thing_raw } from "./thing.ts";
import { graph as graph_raw } from "./graph.ts";

export const first: ParserFn = (sql, offset) => {
  const res = tuple(ident, ending)(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'part',
    position: res.position,
    length: res.length,
    value: {
      type: 'field',
      value: res.sub![0].data
    }
  }

  return res
}

export const all = map(
  alt(
    tuple(char('.'), char('*')),
    tuple(char('['), char('*'), char(']'))
  ),
  {
    type: 'part',
    value: 'all'
  }
)

export const last = map(
  tuple(char("["), char("$"), char("]")),
  {
    type: 'part',
    value: 'last'
  }
)

export const index: ParserFn = (sql, offset) => {
  const res = tuple(char('['), number, char(']'))(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'part',
    value: {
      type: 'index',
      value: res.sub![1].data
    }
  }

  return res
}


export const field: ParserFn = (sql, offset) => {
  const res = tuple(char('.'), ident, ending)(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'part',
    value: {
      type: 'field',
      value: res.sub![1].data
    },
    position: res.position,
    length: res.length
  }

  return res
}

export const filter: ParserFn = (sql, offset) => {
  const res = tuple(
    char('['), 
    alt(
      tag_no_case('WHERE'), 
      tag('?')
    ),
    shouldbespace,
    value,
    char(']')
  )(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'part',
    value: {
      type: 'filter',
      value: res.sub![3].data
    },
    position: res.position,
    length: res.length
  }

  return res
}

export const thing: ParserFn = (sql, offset) => {
  const res = thing_raw(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'part',
    value: {
      type: 'thing',
      value: res.data
    },
    position: res.position,
    length: res.length
  }

  return res
}

export const graph: ParserFn = (sql, offset) => {
  const res = graph_raw(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'part',
    value: {
      type: 'graph',
      value: res.data
    },
    position: res.position,
    length: res.length
  }

  return res
}

export const part = alt(all, last, index, graph, filter)