import { shouldbespace } from "../comment.ts";
import { map, opt, tag_no_case, tuple } from "../_base.ts";

export const cancel = map(
  tuple(
    tag_no_case("CANCEL"),
    opt(tuple(
      shouldbespace,
      tag_no_case("TRANSACTION"),
    )),
  ),
  { type: "transaction", value: "cancel" },
);
