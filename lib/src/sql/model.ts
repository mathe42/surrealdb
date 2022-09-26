import { ident_raw } from "./ident.ts";
import { char, ParserFn, take_u64, tuple } from "./_base.ts";

const model_countParser = tuple(
  char("|"),
  ident_raw,
  char(":"),
  take_u64,
  char("|"),
);

export const model_count: ParserFn = (sql, offset) => {
  const res = model_countParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "model",
    value: {
      type: "count",
      table: res.sub![1].data,
      value: res.sub![3].data,
    },
  };

  return res;
};

const modal_rangeParser = tuple(
  char("|"),
  ident_raw,
  char(":"),
  take_u64,
  char("."),
  char("."),
  take_u64,
  char("|"),
);

export const model_range: ParserFn = (sql, offset) => {
  const res = modal_rangeParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "model",
    value: {
      type: "range",
      table: res.sub![1].data,
      begin: res.sub![3].data,
      end: res.sub![6].data,
    },
  };

  return res;
};
