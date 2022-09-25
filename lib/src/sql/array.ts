import { mightbespace } from "./comment.ts";
import { value } from "./value/value.ts";
import { char, opt, ParserFn, seperatedList, tuple } from "./_base.ts";

const arrayParser = tuple(
  char('['),
  mightbespace,
  seperatedList(char(','), value),
  opt(char(',')),
  mightbespace,
  char(']')
)
export const array:ParserFn = (sql, offset) => {
  const res = arrayParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'array',
    value: res.sub![3].data,
    position: res.position,
    length: res.length
  }

  return res
}