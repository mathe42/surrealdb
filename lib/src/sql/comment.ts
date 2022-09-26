import {
  alt,
  char,
  many,
  ParserFn,
  space,
  takeUntil,
  takeUntilLE,
  tuple,
} from "./_base.ts";

const dashParser = tuple(char("-"), char("-"), takeUntilLE);
const dash: ParserFn = (sql, offset) => {
  const res = dashParser(sql, offset);
  if (res.type === "error") return res;

  res.comment = {
    position: res.position + 2,
    length: res.length - 2,
    content: res.sub![2]!.found,
  };

  return res;
};
const hashParser = tuple(char("#"), takeUntilLE);
const hash: ParserFn = (sql, offset) => {
  const res = hashParser(sql, offset);
  if (res.type === "error") return res;

  res.comment = {
    position: res.position + 1,
    length: res.length - 1,
    content: res.sub![1]!.found,
  };

  return res;
};
const slashParser = tuple(char("/"), char("/"), takeUntilLE);
const slash: ParserFn = (sql, offset) => {
  const res = slashParser(sql, offset);
  if (res.type === "error") return res;

  res.comment = {
    position: res.position + 2,
    length: res.length - 2,
    content: res.sub![2]!.found,
  };

  return res;
};
const blockParser = tuple(
  char("/"),
  char("*"),
  takeUntil("*/"),
  char("*"),
  char("/"),
);
const block: ParserFn = (sql, offset) => {
  const res = blockParser(sql, offset);
  if (res.type === "error") return res;

  res.comment = {
    position: res.position + 4,
    length: res.length - 4,
    content: res.sub![2]!.found,
  };

  return res;
};

export const comment = many(alt(dash, hash, slash, block));
const paddedComment = tuple(space(true), comment, space(true));
export const shouldbespace = alt(paddedComment, space());
export const mightbespace = alt(paddedComment, space(true));
