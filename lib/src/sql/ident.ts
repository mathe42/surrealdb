import {
  alt,
  char,
  ParserFn,
  takeUntilEsc,
  takeWhile,
  tuple,
} from "./_base.ts";

// const ident = ident_raw

const ident_defaultParser = takeWhile((chr) => /[a-zA-Z0-9]/.test(chr));
const ident_default: ParserFn = (sql, offset) => {
  const res = ident_defaultParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "ident",
    value: res.found,
    position: res.position,
    length: res.length,
  };

  return res;
};

const BRACKET_L = "⟨";
const BRACKET_R = "⟩";

const ident_bracketsParser = tuple(
  char(BRACKET_L),
  takeWhile((chr) => chr != BRACKET_R),
  char(BRACKET_R),
);
const ident_brackets: ParserFn = (sql, offset) => {
  const res = ident_bracketsParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "ident",
    value: res.sub![1].found,
    position: res.position,
    length: res.length,
  };

  return res;
};
const ident_backtickParser = tuple(
  char("`"),
  takeUntilEsc("\\`", "`"),
  char("`"),
);
const ident_backtick: ParserFn = (sql, offset) => {
  const res = ident_backtickParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "ident",
    value: res.sub![1].found,
    position: res.position,
    length: res.length,
  };

  return res;
};

export const ident_raw = alt(ident_default, ident_brackets, ident_backtick);
export const ident = ident_raw;
