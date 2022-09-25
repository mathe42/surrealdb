import { shouldbespace } from "./comment.ts";
import { map, alt, ParserFn } from "./_base.ts";
import { tag_no_case } from "./_base.ts";
import { tuple } from "./_base.ts";
import { fields } from "./field.ts";

const fieldsOut: ParserFn = (sql, offset) => {
  const res = fields(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'output',
    value: {
      type: 'fields',
      value: res.data
    },
    position: res.position,
    length: res.length,
  }

  return res
}

const outputParser = tuple(
  tag_no_case("RETURN"),
  shouldbespace,
  alt(
    map(tag_no_case("NONE"), {type: 'output', value: 'None'}),
		map(tag_no_case("NULL"), {type: 'output', value: 'Null'}),
		map(tag_no_case("DIFF"), {type: 'output', value: 'Diff'}),
		map(tag_no_case("AFTER"), {type: 'output', value: 'After'}),
		map(tag_no_case("BEFORE"), {type: 'output', value: 'Before'}),
		fieldsOut
  )
)

export const first: ParserFn = (sql, offset) => {
  const res = outputParser(sql, offset)

  if(res.type === 'error') return res

  res.data = res.sub![2].data

  return res
}