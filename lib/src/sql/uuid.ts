import { alt, char, ParserFn, repeat, takeWhile, tuple } from "./_base.ts";

const hex = takeWhile((chr) => /[a-fA-F0-9]/.test(chr));

const uuid_raw = tuple(
  repeat(hex, 8),
  char("-"),
  repeat(hex, 4),
  char("-"),
  alt(char("1"), char("2"), char("3"), char("4")),
  repeat(hex, 3),
  char("-"),
  repeat(hex, 4),
  char("-"),
  repeat(hex, 12),
);

const uuidParser = alt(
  tuple(
    char('"'),
    uuid_raw,
    char('"'),
  ),
  tuple(
    char("'"),
    uuid_raw,
    char("'"),
  ),
);
export const uuid: ParserFn = (sql, offset) => {
  const res = uuidParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "uuid",
    value: res.sub![1].found,
    position: res.position,
    length: res.length,
  };

  return res;
};
