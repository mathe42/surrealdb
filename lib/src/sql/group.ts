import { shouldbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { opt, ParserFn, seperatedList, tag_no_case, tuple } from "./_base.ts";
import { basic } from "./idiom.ts";

const group_raw = basic;
const groupParser = tuple(
  tag_no_case("GROUP"),
  opt(tuple(shouldbespace, tag_no_case("BY"))),
  shouldbespace,
  seperatedList(commas, group_raw, false),
);

export const group: ParserFn = (sql, offset) => {
  const res = groupParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "groupby",
    value: res.data[3],
    position: res.position,
    length: res.length,
  };

  return res;
};
