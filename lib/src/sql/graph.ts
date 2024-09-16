import { mightbespace, shouldbespace } from "./comment.ts";
import { cond } from "./cond.ts";
import { dir } from "./dir.ts";
import { idiom } from "./idiom.ts";
import { table, tables } from "./table.ts";
import { alt, char, map, opt, ParserFn, tag_no_case, tuple } from "./_base.ts";

const any = map(char("?"), {
  type: "tables",
  value: "#DEFAULT#",
});

const one = table;

const simpleParser = alt(any, one);
const simple: ParserFn = (sql, offset) => {
  const res = simpleParser(sql, offset);

  if (res.type === "error") return res;

  res.data = [
    res.data,
  ];

  return res;
};

const customParser = tuple(
  char("("),
  mightbespace,
  alt(any, tables),
  opt(
    tuple(
      shouldbespace,
      cond,
    ),
  ),
  opt(
    tuple(
      shouldbespace,
      tag_no_case("AS"),
      shouldbespace,
      idiom,
    ),
  ),
  mightbespace,
  char(")"),
);
const custom: ParserFn = (sql, offset) => {
  const res = simpleParser(sql, offset);

  if (res.type === "error") return res;

  res.data = [
    res.data[2],
    res.data[3],
    res.data[4],
  ];

  return res;
};

const graphParser = tuple(
  dir,
  alt(simple, custom),
);
export const graph: ParserFn = (sql, offset) => {
  const res = graphParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "graph",
    value: {
      dir: res.data[0],
      what: res.data[0][0],
      cond: res.data[0][1],
      alias: res.data[0][2],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};
