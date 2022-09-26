import { ident_raw } from "./ident.ts";
import { integer } from "./number.ts";
import { alt, ParserFn } from "./_base.ts";
import { array } from "./array.ts";
import { object } from "./object.ts";

export const id: ParserFn = (sql, offset) => {
  const res = alt(
    integer,
    ident_raw,
    object,
    array,
  )(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "id",
    value: res.data,
    position: res.position,
    length: res.length,
  };

  return res;
};
