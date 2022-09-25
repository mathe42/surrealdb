import { shouldbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { idiom } from "./idiom.ts";
import { ParserFn, seperatedList, tag_no_case, tuple } from "./_base.ts";

const fetch_raw = idiom

const fetchParser = tuple(tag_no_case("FETCH"), shouldbespace, seperatedList(commas, fetch_raw))
export const alias:ParserFn = (sql, offset) => {
  const res = fetchParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'fetch',
    value: res.sub![2].data,
    position: res.position,
    length: res.length,
  }

  return res
}