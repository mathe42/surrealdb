import { alt, many, opt, ParserFn, tag, takeUntilEsc, tuple } from "./_base.ts";

const SINGLE = "'";
const SINGLE_ESC = "\\'";

const DOUBLE = '"';
const DOUBLE_ESC = '\\"';

const BACKTICK = "`";
const BACKTICK_ESC = "\\`";

const OBJECT_BEG = "{";
const OBJECT_END = "}";

const wrapper = (tag_normal: string, tag_esc: string) => {
  return tuple(
    tag(tag_normal),
    opt(takeUntilEsc(tag_esc, tag_normal)),
    tag(tag_normal),
  );
};

const badChars = "{}'`\"";
const charAny: ParserFn = (sql, offset) => {
  if (badChars.includes(sql[0])) {
    return {
      type: "error",
      error: {
        type: "JS-Error",
        message: "unexpected object boundary at " + offset,
        position: offset,
      },
    };
  }

  return {
    position: offset,
    length: 1,
    rest: sql.slice(1),
    found: sql[0],
    type: "result",
  };
};

const script_raw: ParserFn = (sql, offset) => {
  return many(
    alt(
      charAny,
      char_object,
      string_single,
      string_double,
      string_backtick,
    ),
  )(sql, offset);
};

const string_backtick = wrapper(BACKTICK, BACKTICK_ESC);
const string_double = wrapper(DOUBLE, DOUBLE_ESC);
const string_single = wrapper(SINGLE, SINGLE_ESC);
const char_object = tuple(tag(OBJECT_BEG), script_raw, tag(OBJECT_END));

export const script: ParserFn = (sql, offset) => {
  const res = script_raw(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "JS",
    value: res.found,
    position: res.position,
    length: res.length,
  };

  return res;
};
