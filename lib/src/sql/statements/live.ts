import { shouldbespace } from "../comment.ts";
import { view_raw } from "../view.ts";
import { ParserFn, tag_no_case, tuple } from "../_base.ts";

const liveParser = tuple(
  tag_no_case("LIVE"),
  shouldbespace,
  view_raw,
);
export const live: ParserFn = (sql, offset) => {
  const res = liveParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "live",
    value: res.data[2],
    position: res.position,
    length: res.length,
  };

  return res;
};
