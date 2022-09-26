import { char, ParserFn, takeUntilEsc, tuple } from "./_base.ts";

const regexParser = tuple(
  char("/"),
  takeUntilEsc("\\/", "/"),
  char("/"),
);

export const script: ParserFn = (sql, offset) => {
  const res = regexParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "regex",
    value: res.found,
    position: res.position,
    length: res.length,
  };

  return res;
};
