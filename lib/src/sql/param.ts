import { char, ParserFn, tuple } from "./_base.ts";
import { idiom as idiomParam } from "./idiom.ts";

const paramParser = tuple(char('$'), idiomParam)

export const param: ParserFn = (sql, offset) => {
  const res = paramParser(sql, offset)
  
  if(res.type === 'error') return res

  res.data = {
    type: 'param',
    value: res.found.slice(1),
    position: res.position,
    length: res.length,
  }

  return res
}