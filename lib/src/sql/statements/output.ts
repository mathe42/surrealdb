import { shouldbespace } from "../comment.ts";
import { value } from "../value/value.ts";
import { ParserFn, tag_no_case, tuple } from "../_base.ts";

const outputParser = tuple(tag_no_case("RETURN"), shouldbespace, value);
export const output: ParserFn = (sql, offset) => {
  const res = outputParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "return",
    value: res.sub![2].data,
    position: res.position,
    length: res.length,
  };

  return res;
};
