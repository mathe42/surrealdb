import { shouldbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { idiom } from "./idiom.ts";
import { value } from "./value/value.ts";
import { alt, map, ParserFn, seperatedList, tag, tag_no_case, tuple } from "./_base.ts";

export const all = map(tag('*'), {
  type: 'field',
  value: 'all'
})

export const alone:ParserFn = (sql, offset) => {
  const res = value(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'field',
    value: {
      type: 'alone',
      value: res.data
    },
    position: res.position,
    length: res.length,
  }

  return res
}

const aliasParser = tuple(value, shouldbespace, tag_no_case('AS'), shouldbespace, idiom)
export const alias:ParserFn = (sql, offset) => {
  const res = aliasParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'field',
    value: {
      type: 'alias',
      value: res.sub![0].data,
      as: res.sub![4].data
    },
    position: res.position,
    length: res.length,
  }

  return res
}

export const field = alt(all, alias, alone)

export const fields = seperatedList(commas,field)