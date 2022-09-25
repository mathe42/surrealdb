import { shouldbespace } from "./comment.ts";
import { duration } from "./duration.ts";
import { ParserFn, tag_no_case, tuple } from "./_base.ts";

const timeoutParser = tuple(tag_no_case("TIMEOUT"), shouldbespace, duration)

export const timeout: ParserFn = (sql, offset) => {
  const res = timeoutParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'timeout',
    value: res.sub![2].data,
    position: res.position,
    length: res.length,
    keywordLength: res.sub![2].position - res.position 
  }

  return res
}