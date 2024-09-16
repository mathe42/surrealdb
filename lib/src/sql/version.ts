import { shouldbespace } from "./comment.ts";
import { datetime } from "./datetime.ts";
import { ParserFn, tag_no_case, tuple } from "./_base.ts";

const versionParser = tuple(tag_no_case("VERSION"), shouldbespace, datetime);
export const version: ParserFn = (sql, offset) => {
  const res = versionParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "version",
    value: res.data[2],
  };

  return res;
};
