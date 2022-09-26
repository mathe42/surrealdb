import { mightbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { table } from "./table.ts";
import { alt, map } from "./_base.ts";
import { seperatedList } from "./_base.ts";
import { char } from "./_base.ts";
import { tag } from "./_base.ts";
import { tuple } from "./_base.ts";
import { getDataIndex } from "./_base.ts";

const record = getDataIndex(
  tuple(
    tag("record"),
    mightbespace,
    char("("),
    seperatedList(commas, table, false),
    char(")"),
  ),
  3,
);

const geometry = getDataIndex(
  tuple(
    tag("geometry"),
    mightbespace,
    char("("),
    seperatedList(
      commas,
      alt(
        tag("feature"),
        tag("point"),
        tag("line"),
        tag("polygon"),
        tag("multipoint"),
        tag("multiline"),
        tag("multipolygon"),
        tag("collection"),
      ),
    ),
    char(")"),
  ),
  3,
);

export const kind = alt(
  map(tag("any"), { type: "kind", value: "Any" }),
  map(tag("array"), { type: "kind", value: "Array" }),
  map(tag("bool"), { type: "kind", value: "Bool" }),
  map(tag("datetime"), { type: "kind", value: "Datetime" }),
  map(tag("decimal"), { type: "kind", value: "Decimal" }),
  map(tag("duration"), { type: "kind", value: "Duration" }),
  map(tag("float"), { type: "kind", value: "Float" }),
  map(tag("int"), { type: "kind", value: "Int" }),
  map(tag("number"), { type: "kind", value: "Number" }),
  map(tag("object"), { type: "kind", value: "Object" }),
  map(tag("string"), { type: "kind", value: "String" }),
  map(record, { type: "kind", value: "Record" }),
  map(geometry, { type: "kind", value: "Geometry" }),
);
