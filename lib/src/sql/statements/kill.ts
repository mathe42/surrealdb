import { shouldbespace } from "../comment.ts";
import { uuid } from "../uuid.ts";
import { ParserFn, tag_no_case, tuple } from "../_base.ts";

const killParser = tuple(tag_no_case("KILL"), shouldbespace, uuid);

export const kill: ParserFn = (sql, offset) => {
  const res = killParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "statement:kill",
    value: {
      id: res.sub![2].data,
    },
  };

  return res;
};
