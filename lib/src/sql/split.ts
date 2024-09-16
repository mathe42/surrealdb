import { shouldbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { basic } from "./idiom.ts";
import { opt, ParserFn, seperatedList, tag_no_case, tuple } from "./_base.ts";

const split_raw = basic;
const splitParser = tuple(
  tag_no_case("SPLIT"),
  opt(tuple(shouldbespace, tag_no_case("ON"))),
  shouldbespace,
  seperatedList(commas, split_raw),
);

export const split: ParserFn = (sql, offset) => {
  const res = splitParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "split",
    value: res.sub![3].data,
    position: res.position,
    length: res.length,
  };

  return res;
};
