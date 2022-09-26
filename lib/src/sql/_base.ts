export interface Comment {
  position: number;
  length: number;
  content: string;
}

export interface Result {
  type: "result";
  rest: string;
  found: string;
  position: number;
  length: number;
  sub?: Result[];
  data?: any;
  comment?: Comment;
}

export interface Error {
  type: "error";
  sub?: Result[];
  error: ErrorX;
}

export interface ErrorX {
  type: string;
  position: number;
  message: string;
  sub?: ErrorX[];
}

export type ParserFn = (sql: string, offset: number) => Result | Error;

export function tag(tag: string): ParserFn {
  return (sql: string, offset: number) => {
    const shouldBeTag = sql.slice(0, tag.length);

    if (shouldBeTag == tag) {
      return {
        type: "result",
        rest: sql.slice(tag.length),
        found: shouldBeTag,
        position: offset,
        length: tag.length,
      };
    }

    return {
      type: "error",
      error: {
        type: "expected keyword",
        position: offset,
        message: "Expected keyword " + tag,
      },
    };
  };
}

export function tag_no_case(tag: string): ParserFn {
  tag = tag.toLowerCase();

  return (sql: string, offset: number) => {
    const shouldBeTag = sql.slice(0, tag.length);

    if (shouldBeTag.toLowerCase() == tag) {
      return {
        type: "result",
        rest: sql.slice(tag.length),
        found: shouldBeTag,
        position: offset,
        length: tag.length,
      };
    }

    return {
      type: "error",
      error: {
        type: "expected keyword",
        position: offset,
        message: "Expected keyword " + tag,
      },
    };
  };
}

export function opt(fn: ParserFn): ParserFn {
  return (sql: string, offset: number) => {
    const res = fn(sql, offset);

    if (res.type === "result") {
      return res;
    }

    return {
      type: "result",
      rest: sql,
      found: "",
      position: offset,
      length: 0,
    };
  };
}

export function tuple(...fns: ParserFn[]): ParserFn {
  return (sql: string, offset: number) => {
    let currentRest = sql;
    let currentOffset = offset;

    let results: Result[] = [];

    for (let i = 0; i < fns.length; i++) {
      const res = fns[i](currentRest, currentOffset);
      if (res.type === "error") {
        return {
          ...res,
          sub: results,
        };
      }
      currentRest = res.rest;
      currentOffset += res.length;

      results.push(res);
    }

    return {
      type: "result",
      rest: currentRest,
      found: sql.slice(0, currentOffset - offset),
      data: results.map((v) => v.data),
      position: offset,
      sub: results,
      length: currentOffset - offset,
    };
  };
}

export function alt(...fns: ParserFn[]): ParserFn {
  return (sql: string, offset: number) => {
    let err: ErrorX[] = [];

    for (let i = 0; i < fns.length; i++) {
      const res = fns[i](sql, offset);

      if (res.type === "result") {
        return res;
      }

      err.push(res.error);
    }

    return {
      type: "error",
      error: {
        sub: err,
        type: "no variant match",
        message: "No match found",
        position: offset,
      },
    };
  };
}
const spaces = [
  " ",
  "\n",
  "\t",
  "\r",
];
export function space(allow0 = false): ParserFn {
  return (sql: string, offset: number) => {
    for (let i = 0; i < sql.length; i++) {
      if (!spaces.includes(sql[i])) {
        if ((i > 0 && !allow0) || (i >= 0 && allow0)) {
          return {
            type: "result",
            rest: sql.slice(i),
            found: sql.slice(0, i),
            position: offset,
            length: i,
          };
        } else {
          return {
            type: "error",
            error: {
              type: "expected space",
              position: offset,
              message: "Expected space",
            },
          };
        }
      }
    }

    return {
      type: "result",
      rest: "",
      found: sql,
      position: offset,
      length: sql.length,
    };
  };
}

export function many(fn: ParserFn, allow0 = false): ParserFn {
  return (sql: string, offset: number) => {
    let results: Result[] = [];
    let currentRest = sql;
    let currentOffset = offset;

    while (true) {
      const res = fn(currentRest, currentOffset);

      if (res.type === "error") {
        if (results.length === 0 && !allow0) {
          return res;
        }

        return {
          type: "result",
          rest: currentRest,
          position: offset,
          length: currentOffset - offset,
          sub: results,
          found: sql.slice(0, currentOffset - offset),
          data: results.map((v) => v.data),
        };
      }

      results.push(res);
      currentRest = res.rest;
      currentOffset += res.length;
    }
  };
}

export function char(char: string): ParserFn {
  return (sql: string, offset) => {
    if (sql[0] === char) {
      return {
        type: "result",
        length: 1,
        found: char,
        position: offset,
        rest: sql.slice(1),
      };
    }

    return {
      type: "error",
      error: {
        message: `char ${char} not found`,
        position: offset,
        type: "char not found",
      },
    };
  };
}

export const digit: ParserFn = (sql, offset) => {
  if (/\d/.test(sql[0])) {
    return {
      type: "result",
      length: 1,
      found: sql[0],
      position: offset,
      rest: sql.slice(1),
    };
  }

  return {
    type: "error",
    error: {
      message: `digit not found`,
      position: offset,
      type: "digit not found",
    },
  };
};

export function takeUntil(tag: string): ParserFn {
  return (sql: string, offset: number) => {
    let pre = "";
    let rest = sql;

    while (rest.length > 0 && !rest.startsWith(tag)) {
      pre += rest[0];
      rest = rest.slice(1);
    }

    if (rest.length === 0) {
      return {
        type: "error",
        error: {
          message: tag + " not found",
          type: "tag not found",
          position: offset,
        },
      };
    }

    return {
      type: "result",
      length: pre.length,
      position: offset,
      found: pre,
      rest,
    };
  };
}

export function takeUntilEsc(escTag: string, tag: string): ParserFn {
  return (sql: string, offset: number) => {
    let pre = "";
    let rest = sql;

    while (rest.length > 0 && !rest.startsWith(tag)) {
      if (rest.startsWith(escTag)) {
        pre += escTag, rest = rest.slice(escTag.length);
      } else {
        pre += rest[0];
        rest = rest.slice(1);
      }
    }

    if (rest.length === 0) {
      return {
        type: "error",
        error: {
          message: tag + " not found",
          type: "tag not found",
          position: offset,
        },
      };
    }

    return {
      type: "result",
      length: pre.length,
      position: offset,
      found: pre,
      rest,
    };
  };
}

export const takeUntilLE: ParserFn = (sql: string, offset: number) => {
  let pre = "";
  let rest = sql;

  while (rest.length > 0 && !rest.startsWith("\n") && !rest.startsWith("\r")) {
    pre += rest[0];
    rest = rest.slice(1);
  }

  while (rest.length > 0 && (rest.startsWith("\n") || rest.startsWith("\r"))) {
    pre += rest[0];
    rest = rest.slice(1);
  }

  return {
    type: "result",
    length: pre.length,
    position: offset,
    found: pre,
    rest,
  };
};

export function takeWhile(cond: (char: string) => boolean): ParserFn {
  return (sql, offset) => {
    let pre = "";
    let rest = sql;

    while (cond(rest[0])) {
      pre += rest[0];
      rest = rest.slice(1);
    }

    return {
      type: "result",
      rest,
      position: offset,
      found: pre,
      length: pre.length,
    };
  };
}

export const take_usize: ParserFn = (sql, offset) => {
  const res = takeWhile((ch) => /\d/.test(ch))(sql, offset) as Result;

  if (res.found.length === 0) {
    return {
      type: "error",
      error: {
        type: "no digit found",
        message: "Digit [0-9] expected",
        position: offset,
      },
    };
  }

  res.data = {
    type: "int",
    value: Number.parseInt(res.found),
  };

  return res;
};
export const take_u64 = take_usize;

export function getComments(res: Result): Comment[] {
  const comments: Comment[] = [];

  if (res.comment) {
    comments.push(res.comment);
  }

  if (res.sub) {
    comments.push(...res.sub.flatMap((res) => getComments(res)));
  }

  return comments;
}

export function seperatedList(
  seperator: ParserFn,
  item: ParserFn,
  allow0 = true,
): ParserFn {
  const baseParser = tuple(
    item,
    many(tuple(seperator, item), true),
  );
  const parser = allow0 ? opt(baseParser) : baseParser;

  return (sql, offset) => {
    const res = parser(sql, offset);

    if (res.type === "error") return res;

    if (res.length === 0) {
      res.data = {
        type: "array",
        values: [],
      };
    } else {
      const firstItem = res.sub![0].data;
      const restItems = res.sub![1].sub!.map((tup) => tup.sub![1].data);

      res.data = {
        type: "list",
        values: [
          firstItem,
          ...restItems,
        ],
      };
    }

    return res;
  };
}

export function take_digits_range(count: number): ParserFn {
  const parser = repeat(digit, count);

  return (sql, offset) => {
    const res = parser(sql, offset);

    if (res.type === "error") return res;

    res.data = {
      position: res.position,
      length: res.length,
      type: "number",
      value: parseInt(res.found),
    };

    return res;
  };
}

export function repeat(fn: ParserFn, count: number) {
  return tuple(..."x".repeat(count - 1).split("x").map(() => fn));
}

export function map(fn: ParserFn, data: any): ParserFn {
  return (sql, offset) => {
    const res = fn(sql, offset);

    if (res.type === "error") return res;

    res.data = {
      position: res.position,
      length: res.length,
      ...data,
    };

    return res;
  };
}

export function peek(fn: ParserFn): ParserFn {
  return (sql, offset) => {
    const res = fn(sql, offset);

    if (res.type === "error") return res;

    return {
      type: "result",
      sub: [res],
      position: offset,
      length: 0,
      found: "",
      rest: sql,
    };
  };
}

export const eof: ParserFn = (sql, offset) => {
  if (sql.length === 0) {
    return {
      type: "result",
      position: offset,
      length: 0,
      found: "",
      rest: "",
    };
  }

  return {
    type: "error",
    error: {
      message: "expected end of input found " + sql.slice(7),
      type: "expected eof",
      position: offset,
    },
  };
};

export function getDataIndex(fn: ParserFn, index: number): ParserFn {
  return (sql, offset) => {
    const res = fn(sql, offset);

    if (res.type === "error") return res;

    res.data = res.data[index];

    return res;
  };
}

// TODO implement
export const recognize_float: ParserFn = (() => {}) as any;

export const double = recognize_float;

export const resolve = (fn: () => ParserFn): ParserFn => {
  return (sql, offset) => {
    return fn()(sql, offset);
  };
};
