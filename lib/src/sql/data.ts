import { mightbespace, shouldbespace } from "./comment.ts";
import { commas } from "./common.ts";
import { idiom } from "./idiom.ts";
import { assigner } from "./operators.ts";
import { value } from "./value/value.ts";
import {
alt,
  getDataIndex,
  ParserFn,
  seperatedList,
  tag,
  tag_no_case,
  tuple,
} from "./_base.ts";

const updateParser = getDataIndex(
  tuple(
    tag_no_case("ON DUPLICATE KEY UPDATE"),
    shouldbespace,
    seperatedList(
      commas,
      tuple(
        idiom,
        mightbespace,
        assigner,
        value,
      ),
      false,
    ),
  ),
  2,
);

export const update: ParserFn = (sql, offset) => {
  const res = updateParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "updateExpression",
    value: res.data,
  };

  return res;
};

export const single = value;

const valuesParser = tuple(
  tag_no_case("("),
  seperatedList(commas, idiom, false),
  tag_no_case(")"),
  shouldbespace,
  tag_no_case("VALUES"),
  shouldbespace,
  seperatedList(
    commas,
    getDataIndex(
      tuple(
        tag_no_case("("),
        seperatedList(commas, value),
        tag_no_case(")"),
      ),
      1,
    ),
    false,
  ),
);
export const values: ParserFn = (sql, offset) => {
  const res = valuesParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "valuesExpression",
    value: {
      def: res.data[1],
      values: res.data[6],
    },
  };

  return res;
};

const contentParser = tuple(
  tag_no_case("CONTENT"),
  shouldbespace,
  value,
);
const content: ParserFn = (sql, offset) => {
  const res = contentParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "contentExpression",
    value: res.data[2],
  };

  return res;
};

const replaceParser = tuple(
  tag_no_case("CONTENT"),
  shouldbespace,
  value,
);
const replace: ParserFn = (sql, offset) => {
  const res = replaceParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "replaceExpression",
    value: res.data[2],
  };

  return res;
};

const mergeParser = tuple(
  tag_no_case("CONTENT"),
  shouldbespace,
  value,
);
const merge: ParserFn = (sql, offset) => {
  const res = mergeParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "mergeExpression",
    value: res.data[2],
  };

  return res;
};

const patchParser = tuple(
  tag_no_case("CONTENT"),
  shouldbespace,
  value,
);
const patch: ParserFn = (sql, offset) => {
  const res = patchParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "patchExpression",
    value: res.data[2],
  };

  return res;
};

const setParser = tuple(
  tag_no_case("SET"),
  shouldbespace,
  seperatedList(
    commas,
    tuple(idiom, mightbespace, assigner, mightbespace, value),
    false,
  ),
);
const set: ParserFn = (sql, offset) => {
  const res = setParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "setExpression",
    value: res.data[2].map((v: any[])=>({
      field: v[0],
      op: v[2],
      value: v[4]
    })),
  };

  return res;

}

export const data = alt(set, patch, merge, replace, content)