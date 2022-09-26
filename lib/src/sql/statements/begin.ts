import { shouldbespace } from "../comment.ts";
import { map, opt, tag_no_case, tuple } from "../_base.ts";

export const begin = map(
  tuple(
    tag_no_case("BEGIN"),
    opt(tuple(
      shouldbespace,
      tag_no_case("TRANSACTION"),
    )),
  ),
  { type: "transaction", value: "begin" },
);
