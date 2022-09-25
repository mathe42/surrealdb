import { ident } from "./ident.ts";
import { ParserFn, seperatedList } from "./_base.ts";
import { commas } from "./common.ts";

export const table: ParserFn = (sql, offset) => {
  const res = ident(sql, offset)
  
  if(res.type === 'error') return res

  res.data = {
    type: 'table',
    value: res.data,
    position: res.position,
    length: res.length
  }

  return res
}

export const tables: ParserFn = (sql, offset) => {
  const res = seperatedList(commas,table,false)(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'tables',
    position: res.position,
    length: res.length,
    value: res.data
  }

  return res
}
