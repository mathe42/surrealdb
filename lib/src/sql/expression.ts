import { operator } from "./operators.ts";
import { single, value } from "./value/value.ts";
import { ParserFn, tuple } from "./_base.ts";

const expressionParser = tuple(single, operator, value);
export const expression: ParserFn = (sql, offset) => {
  const res = expressionParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "expression",
    value: {
      left: res.sub![0].data,
      op: res.sub![1].data,
      right: res.sub![2].data,
    },
    position: res.position,
    length: res.length,
  };

  return res;
};
