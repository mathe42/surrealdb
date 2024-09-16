import { comment } from "./comment.ts";
import { assigner, operator } from "./operators.ts";
import { alt, char, eof, peek, space } from "./_base.ts";

export const number = peek(
  alt(
    space(false),
    operator,
    assigner,
    comment,
    char(")"),
    char("]"),
    char("}"),
    char('"'),
    char(";"),
    char(","),
    char(".."),
    eof,
  ),
);

export const ident = peek(
  alt(
    space(false),
    operator,
    assigner,
    comment,
    char(")"),
    char("]"),
    char("}"),
    char(";"),
    char(","),
    char("."),
    char("["),
    char("-"),
    eof,
  ),
);
