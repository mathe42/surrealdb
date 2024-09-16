import { shouldbespace } from "../comment.ts";
import { map, opt, tag_no_case, tuple } from "../_base.ts";

export const commit = map(
  tuple(
    tag_no_case("COMMIT"),
    opt(tuple(
      shouldbespace,
      tag_no_case("TRANSACTION"),
    )),
  ),
  { type: "transaction", value: "commit" },
);
