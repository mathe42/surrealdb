import { alt, char, ParserFn, tuple } from "./_base.ts";

const dirBOTH = tuple(char("<"), char("-"), char(">"));
const dirLEFT = tuple(char("<"), char("-"));
const dirRIGHT = tuple(char("-"), char(">"));
const dirParser = alt(dirBOTH, dirLEFT, dirRIGHT);

const type = {
  "->": "right",
  "<->": "both",
  "<-": "left",
};

export const dir: ParserFn = (sql: string, offset: number) => {
  const res = dirParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "direction",
    value: type[res.found as keyof typeof type],
    position: res.position,
    length: res.length,
  };

  return res;
};
