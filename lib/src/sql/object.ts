import { mightbespace } from "./comment.ts";
import { value } from "./value/value.ts";
import {
  alt,
  char,
  opt,
  ParserFn,
  seperatedList,
  takeUntilEsc,
  takeWhile,
  tuple,
} from "./_base.ts";

const key_none = takeWhile((chr) => /[a-zA-Z_0-9]/.test(chr));
const key_single = tuple(char("'"), takeUntilEsc("\\'", "'"), char("'"));
const key_double = tuple(char('"'), takeUntilEsc('\\"', '"'), char('"'));

const key = alt(key_none, key_single, key_double);

const itemParser = tuple(key, mightbespace, char(":"), mightbespace, value);
const item: ParserFn = (sql, offset) => {
  const res = itemParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "object:item",
    value: {
      key: {
        value: res.sub![0].found,
        position: res.sub![0].position,
        length: res.sub![0].length,
      },
      value: {
        value: res.sub![4].data,
        position: res.sub![4].position,
        length: res.sub![4].length,
      },
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const objectParser = tuple(
  char("{"),
  mightbespace,
  seperatedList(tuple(mightbespace, char(","), mightbespace), item),
  mightbespace,
  opt(char(",")),
  mightbespace,
  char("}"),
);
export const object: ParserFn = (sql, offset) => {
  const res = objectParser(sql, offset);

  if (res.type === "error") return res;

  res.data = res.sub![2].data;

  return res;
};
