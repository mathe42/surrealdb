import { mightbespace, shouldbespace } from "../comment.ts";
import { ident } from "../ending.ts";
import { alt, char, map, ParserFn, tag, tag_no_case, tuple } from "../_base.ts";

const optionParser = tuple(
  tag_no_case("OPTION"),
  shouldbespace,
  ident,
  alt(
    map(tuple(mightbespace, char("="), mightbespace, tag_no_case("TRUE")), {
      value: true,
      type: "boolean",
    }),
    map(tuple(mightbespace, char("="), mightbespace, tag_no_case("FALSE")), {
      value: false,
      type: "boolean",
    }),
    map(tag(""), { value: false, type: "boolean" }),
  ),
);
export const option: ParserFn = (sql, offset) => {
  const res = optionParser(sql, offset);

  if (res.type === "error") return res;

  res.data = res.data[3];

  return res;
};
