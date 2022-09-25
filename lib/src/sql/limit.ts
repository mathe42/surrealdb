import { opt, tag_no_case, tuple, take_usize, ParserFn } from "./_base.ts"
import { shouldbespace } from "./comment.ts";

const limitParser = tuple(
  tag_no_case('LIMIT'), 
  opt(
    tuple(shouldbespace, tag_no_case('BY'))
  ), 
  shouldbespace, 
  take_usize
)

export const limit: ParserFn = (sql, offset) => {
  const res = limitParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'limit',
    value: res.sub?.at(-1)?.data,
    position: res.position,
    length: res.sub![3].position - res.position
  }

  return res
}
