import { id } from "./id.ts";
import { ident_raw } from "./ident.ts";
import { alt, char, ParserFn, tuple } from "./_base.ts";

const thing_normal: ParserFn = (sql, offset) => {
  const res = tuple(ident_raw, char(":"), id)(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "thing",
    value: {
      table: res.sub![0].data,
      id: res.sub![2].data,
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const thing_single: ParserFn = (sql, offset) => {
  const res = tuple(char("'"), thing_normal, char("'"))(sql, offset);

  if (res.type === "error") return res;

  res.data = res.sub![1];

  return res;
};

const thing_double: ParserFn = (sql, offset) => {
  const res = tuple(char('"'), thing_normal, char('"'))(sql, offset);

  if (res.type === "error") return res;

  res.data = res.sub![1];

  return res;
};

const thing_raw = alt(thing_double, thing_single, thing_normal);
export const thing = thing_raw;
