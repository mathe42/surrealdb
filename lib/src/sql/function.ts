import { alt, char, ParserFn, seperatedList, tag, tuple } from "./_base.ts";
import { commas } from "./common.ts";
import { value } from "./value/value.ts";
import { mightbespace } from "./comment.ts";

import { script as func } from "./script.ts";

const function_names: any = () => {};

const normalParser: ParserFn = tuple(
  function_names,
  char("("),
  mightbespace,
  seperatedList(commas, value, true),
  mightbespace,
  char(")"),
);
const normal: ParserFn = (sql, offset) => {
  const res = normalParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "function",
    value: {
      name: res.data[0],
      value: res.data[3],
    },
  };

  return res;
};

const scriptParser = tuple(
  alt(tag("fn::script"), tag("fn"), tag("function")),
  mightbespace,
  tag("("),
  seperatedList(commas, value),
  tag(")"),
  mightbespace,
  char("{"),
  func,
  char("}"),
);
