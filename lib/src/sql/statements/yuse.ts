import { shouldbespace } from "../comment.ts";
import { ident_raw } from "../ident.ts";
import { alt, ParserFn, tag_no_case, tuple } from "../_base.ts";

const bothParser = tuple(
  tag_no_case("USE"),
  shouldbespace,
  alt((tag_no_case("NAMESPACE"), tag_no_case("NS"))),
  shouldbespace,
  ident_raw,
  shouldbespace,
  alt((tag_no_case("DATABASE"), tag_no_case("DB"))),
  shouldbespace,
  ident_raw,
);
const both: ParserFn = (sql, offset) => {
  const res = bothParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "use",
    value: {
      db: res.sub![8].data,
      ns: res.sub![4].data,
    },
  };

  return res;
};

const dbParser = tuple(
  tag_no_case("USE"),
  shouldbespace,
  alt((tag_no_case("DATABASE"), tag_no_case("DB"))),
  shouldbespace,
  ident_raw,
);
const db: ParserFn = (sql, offset) => {
  const res = dbParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "use",
    value: {
      db: res.sub![4].data,
      ns: null,
    },
  };

  return res;
};

const nsParser = tuple(
  tag_no_case("USE"),
  shouldbespace,
  alt((tag_no_case("NAMESPACE"), tag_no_case("NS"))),
  shouldbespace,
  ident_raw,
);
const ns: ParserFn = (sql, offset) => {
  const res = nsParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "use",
    value: {
      db: null,
      ns: res.sub![4].data,
    },
  };

  return res;
};

export const yuse = alt(both, ns, db);
