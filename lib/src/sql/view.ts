import { shouldbespace } from "./comment.ts";
import { group } from "./group.ts";
import { alt, char, opt, ParserFn, tag_no_case, tuple } from "./_base.ts";
import { fields } from "./field.ts";
import { tables } from "./table.ts";
import { cond } from "./cond.ts";

const view_rawParser = tuple(
  tag_no_case("SELECT"),
  shouldbespace,
  fields,
  shouldbespace,
  tag_no_case("FROM"),
  shouldbespace,
  tables,
  opt(tuple(shouldbespace, cond)),
  opt(tuple(shouldbespace, group)),
);
export const view_raw: ParserFn = (sql, offset) => {
  const res = view_rawParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "view",
    value: {
      expr: res.data[2],
      what: res.data[6],
      cond: res.data[7]?.[1] ?? null,
      group: res.data[8]?.[1] ?? null,
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const viewParser = tuple(
  tag_no_case("AS"),
  shouldbespace,
  alt(
    tuple(char("("), view_raw, char(")")),
    view_raw,
  ),
);
export const view: ParserFn = (sql, offset) => {
  const res = viewParser(sql, offset);

  if (res.type === "error") return res;

  res.data = res.data[2].length === 0 ? res.data[2][0] : res.data[2][1];

  return res;
};
