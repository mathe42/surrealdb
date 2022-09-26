import {
  alt,
  char,
  map,
  ParserFn,
  seperatedList,
  tag,
  tuple,
} from "./_base.ts";
import { commas } from "./common.ts";
import { single, value } from "./value/value.ts";
import { mightbespace } from "./comment.ts";
import { script as func } from "./script.ts";

export const namedFunctions = {
  array: [
    "combine",
    "concat",
    "difference",
    "distinct",
    "intersect",
    "len",
    "sort::asc",
    "sort::desc",
    "sort",
    "union",
  ],
  crypto: [
    "argon2::compare",
    "argon2::generate",
    "bcrypt::compare",
    "bcrypt::generate",
    "md5",
    "pbkdf2::compare",
    "pbkdf2::generate",
    "scrypt::compare",
    "scrypt::generate",
    "sha1",
    "sha256",
    "sha512",
  ],
  duration: [
    "days",
    "hours",
    "mins",
    "secs",
    "weeks",
    "years",
  ],
  geo: [
    "area",
    "bearing",
    "centroid",
    "distance",
    "hash::decode",
    "hash::encode",
  ],
  http: [
    "head",
    "get",
    "put",
    "post",
    "patch",
    "delete",
  ],
  is: [
    "alphanum",
    "alpha",
    "ascii",
    "domain",
    "email",
    "hexadecimal",
    "latitude",
    "longitude",
    "numeric",
    "semver",
    "uuid",
  ],
};

const function_names_without_countParser = alt(
  ...Object.keys(namedFunctions).map((key) => {
    return tuple(
      tag(key),
      tag("::"),
      alt(
        ...namedFunctions[key as keyof typeof namedFunctions].map((v) =>
          tag(v)
        ),
      ),
    );
  }),
);

const function_names_without_count: ParserFn = (sql, offset) => {
  const res = function_names_without_countParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "functionname",
    value: {
      group: res.sub![0].found,
      name: res.sub![2].found,
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const function_names = alt(
  function_names_without_count,
  map(tag("count"), {
    type: "functionname",
    value: {
      group: "count",
      name: null,
    },
  }),
);

const function_casts = alt(
  tag("bool"),
  tag("int"),
  tag("float"),
  tag("string"),
  tag("number"),
  tag("decimal"),
  tag("datetime"),
  tag("duration"),
);

const normalParser: ParserFn = tuple(
  function_names,
  char("("),
  mightbespace,
  seperatedList(commas, value, true),
  mightbespace,
  char(")"),
);
const normal: ParserFn = (sql, offset) => {
  const res = normalParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "function",
    value: {
      type: "fn",
      name: res.data[0],
      value: res.data[3],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const scriptParser = tuple(
  alt(tag("fn::script"), tag("fn"), tag("function")),
  mightbespace,
  tag("("),
  seperatedList(commas, value),
  tag(")"),
  mightbespace,
  char("{"),
  func,
  char("}"),
);
const script: ParserFn = (sql, offset) => {
  const res = scriptParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "function",
    value: {
      type: "script",
      content: res.data[7],
      value: res.data[3],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const futureParser = tuple(
  char("<"),
  tag("future"),
  char(">"),
  mightbespace,
  char("{"),
  mightbespace,
  value,
  mightbespace,
  char("}"),
);
const future: ParserFn = (sql, offset) => {
  const res = futureParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "function",
    value: {
      type: "future",
      value: res.data[6],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const castParser = tuple(
  char("<"),
  function_casts,
  char(">"),
  mightbespace,
  single,
);
const cast: ParserFn = (sql, offset) => {
  const res = castParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "function",
    value: {
      type: "cast",
      to: res.data[1].found,
      value: res.data[4],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

export const yfunction = alt(normal, script, future, cast);
