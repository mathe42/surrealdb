import { comment, mightbespace } from "./comment.ts";
import { alt, getDataIndex, many, seperatedList, tuple } from "./_base.ts";
import { set } from "./statements/set.ts";
import { yuse } from "./statements/yuse.ts";
import { live } from "./statements/live.ts";
import { begin } from "./statements/begin.ts";
import { cancel } from "./statements/cancel.ts";
import { commit } from "./statements/commit.ts";
import { output } from "./statements/output.ts";
import { option } from "./statements/option.ts";
import { kill } from "./statements/kill.ts";
import { colons } from "./common.ts";

export const statement = getDataIndex(
  tuple(
    mightbespace,
    alt(
      set,
      yuse,
      // info,
      live,
      kill,
      begin,
      cancel,
      commit,
      output,
      // ifelse,
      // select,
      // create,
      // update,
      // relate,
      // delete,
      // insert,
      // define,
      // remove,
      option,
    ),
    mightbespace,
  ),
  1,
);

export const statements = getDataIndex(
  tuple(
    seperatedList(colons, statement, false),
    many(alt(colons, comment), true),
  ),
  0,
);
