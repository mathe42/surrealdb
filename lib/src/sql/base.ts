import { shouldbespace } from "./comment.ts";
import { ident } from "./ending.ts";
import { alt, map, ParserFn, tag_no_case, tuple } from "./_base.ts";

export const base = alt(
  map(alt(tag_no_case("NAMESPACE"), tag_no_case("NS")), {
    type: "base",
    value: "ns",
  }),
  map(alt(tag_no_case("DATABASE"), tag_no_case("DB")), {
    type: "base",
    value: "db",
  }),
);

const scopeParser = tuple(
  tag_no_case("SCOPE"),
  shouldbespace,
  ident,
);
export const scope: ParserFn = (sql, offset) => {
  const res = scopeParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "base",
    value: "scope",
    id: res.data[2],
    position: res.position,
    length: res.length,
  };

  return res;
};

export const base_or_scope = alt(
  base,
  scope,
);
