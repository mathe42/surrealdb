import { shouldbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { basic } from "./idiom.ts";
import {
  alt,
  map,
  opt,
  ParserFn,
  seperatedList,
  tag,
  tag_no_case,
  tuple,
} from "./_base.ts";

const order_rand = map(tag_no_case("RAND()"), {
  type: "order",
  value: {
    order: null,
    random: true,
    collate: false,
    numeric: false,
    direction: true,
  },
});
const order_rawParser = tuple(
  basic,
  opt(tuple(shouldbespace, tag_no_case("COLLATE"))),
  opt(tuple(shouldbespace, tag_no_case("NUMERIC"))),
  opt(
    alt(
      map(tuple(shouldbespace, tag_no_case("ASC")), {
        type: "direction",
        value: true,
      }),
      map(tuple(shouldbespace, tag_no_case("DESC")), {
        type: "direction",
        value: false,
      }),
    ),
  ),
);
const order_raw: ParserFn = (sql: string, offset: number) => {
  const res = order_rawParser(sql, offset);

  if (res.type === "error") return res;

  res.data = [{
    type: "order",
    value: {
      order: res.data[0],
      random: false,
      collate: res.data[1].length === 2,
      numeric: res.data[2].length === 2,
      direction: res.data[3]?.value ?? true,
    },
  }];

  return res;
};

const orderParser = tuple(
  tag_no_case("ORDER"),
  opt(tuple(shouldbespace, tag_no_case("BY"))),
  shouldbespace,
  alt(
    order_rand,
    seperatedList(commas, order_raw, false),
  ),
);
export const order: ParserFn = (sql: string, offset: number) => {
  const res = orderParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "orders",
    value: res.data[3],
  };

  return res;
};
