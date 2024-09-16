import {
  alt,
  char,
  map,
  ParserFn,
  tag,
  take_digits_range,
  take_u64,
  tuple,
} from "./_base.ts";

const month = take_digits_range(2);
const day = take_digits_range(2);
const hour = take_digits_range(2);
const minute = take_digits_range(2);
const second = take_digits_range(2);

const nanosecondParser = tuple(char("."), take_u64);
const nanosecond: ParserFn = (sql, offset) => {
  const res = nanosecondParser(sql, offset);

  if (res.type === "error") return res;

  const pow = 9 - res.sub![1].length;

  res.data[1].value *= Math.pow(10, pow);

  res.data = res.data[1];

  return res;
};

const sign = alt(
  map(char("-"), { value: -1 }),
  map(char("+"), { value: 1 }),
);

const zone_utc = map(char("Z"), { value: 0 });
const zone_allParser = tuple(sign, hour, char(":"), minute);
const zone_all: ParserFn = (sql, offset) => {
  const res = zone_allParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "timezoneoffset",
    value: res.data[0].value *
      (res.data[1].value * 3600 + res.data[3].value * 60),
    position: res.position,
    length: res.length,
  };

  return res;
};

const zone = alt(zone_utc, zone_all);

const yearParser = tuple(
  alt(sign, map(tag(""), { value: 1 })),
  take_digits_range(4),
);
const year: ParserFn = (sql, offset) => {
  const res = yearParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "year",
    value: res.data[0].value *
      (res.data[1].value * 3600 + res.data[3].value * 60),
    position: res.position,
    length: res.length,
  };

  return res;
};

const nanoParser = tuple(
  year,
  char("-"),
  month,
  char("-"),
  day,
  char("T"),
  hour,
  char(":"),
  minute,
  char(":"),
  second,
  nanosecond,
  zone,
);

const nano: ParserFn = (sql, offset) => {
  const res = nanoParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "datetime",
    value: {
      year: res.data[0],
      month: res.data[2],
      day: res.data[4],
      hour: res.data[6],
      minute: res.data[8],
      second: res.data[10],
      nanosecond: res.data[11],
      zone: res.data[12],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const timeParser = tuple(
  year,
  char("-"),
  month,
  char("-"),
  day,
  char("T"),
  hour,
  char(":"),
  minute,
  char(":"),
  second,
  zone,
);

const time: ParserFn = (sql, offset) => {
  const res = timeParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "datetime",
    value: {
      year: res.data[0],
      month: res.data[2],
      day: res.data[4],
      hour: res.data[6],
      minute: res.data[8],
      second: res.data[10],
      nanosecond: 0,
      zone: res.data[11],
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const dateParser = tuple(
  year,
  char("-"),
  month,
  char("-"),
  day,
);

const date: ParserFn = (sql, offset) => {
  const res = dateParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "datetime",
    value: {
      year: res.data[0],
      month: res.data[2],
      day: res.data[4],
      hour: 0,
      minute: 0,
      second: 0,
      nanosecond: 0,
      zone: 0,
    },
    position: res.position,
    length: res.length,
  };

  return res;
};

const datetime_raw = alt(nano, time, date);

const datetimeParser = alt(
  tuple(char("'"), datetime_raw, char("'")),
  tuple(char('"'), datetime_raw, char('"')),
);
export const datetime: ParserFn = (sql, offset) => {
  const res = datetimeParser(sql, offset);

  if (res.type === "error") return res;

  res.data = res.data[1];

  return res;
};
