import { mightbespace, shouldbespace } from "../comment.ts";
import { value } from "../value/value.ts";
import { char, ParserFn, tag_no_case, tuple } from "../_base.ts";
import { ident_raw } from "../ident.ts";

const setParser = tuple(
  tag_no_case('LET'),
  shouldbespace,
  char('$'),
  ident_raw,
  mightbespace,
  char('='),
  mightbespace,
  value
)
export const set: ParserFn = (sql, offset) => {
  const res = setParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'set',
    value: {
      name: res.sub![3].data,
      value: res.sub![7].data
    }
  }

  return res
}