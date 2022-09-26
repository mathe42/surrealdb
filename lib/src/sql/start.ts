import { shouldbespace } from "./comment.ts";
import { opt, ParserFn, tag_no_case, take_usize, tuple } from "./_base.ts";

export const startParser = tuple(
  tag_no_case("START"),
  opt(tuple(shouldbespace, tag_no_case("AT"))),
  shouldbespace,
  take_usize,
);

export const alias: ParserFn = (sql, offset) => {
  const res = startParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "start",
    value: res.sub![3].data,
    position: res.position,
    length: res.length,
  };

  return res;
};
