import { id } from "./id.ts";
import { ident_raw } from "./ident.ts";
import { char, ParserFn, tuple } from "./_base.ts";

const rangeParser = tuple(ident_raw, char(':'), id, char('.'), char('.'), id)
export const range: ParserFn = (sql, offset) => {
  const res = rangeParser(sql, offset)
  
  if(res.type === 'error') return res

  res.data = {
    type: 'expression',
    position: res.position,
    length: res.length,
    value: {
      tb: res.sub![0].data,
      begin: res.sub![2].data,
      end: res.sub![4].data,
    },

  }

  return res
}