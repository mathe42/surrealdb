import { shouldbespace } from "./comment.ts";
import { ParserFn, tag_no_case, tuple } from "./_base.ts";
import { value } from "./value/value.ts";

const condParser = tuple(tag_no_case('WHERE'), shouldbespace, value)
export const cond: ParserFn = (sql, offset) => {
  const res = condParser(sql, offset)
  
  if(res.type === 'error') return res

  res.data = {
    type: 'cond',
    value: res.sub![2],
    position: res.position,
    length: res.length,
    keywordLength: res.sub![2].position - res.position 
  }

  return res
}