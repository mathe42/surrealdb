import {
  alt,
  char,
  opt,
  ParserFn,
  recognize_float,
  take_u64,
  tuple,
} from "./_base.ts";
import { number as ending } from "./ending.ts";

export const integer: ParserFn = (sql, offset) => {
  const res = tuple(opt(char("-")), take_u64, ending)(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "int",
    value: parseInt(res.found),
  };

  return res;
};

export const decimal: ParserFn = (sql, offset) => {
  const res = tuple(recognize_float, ending)(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "decimal",
    value: parseInt(res.found),
  };

  return res;
};

export const number = alt(integer, decimal);
