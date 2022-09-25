import { mightbespace } from "./comment.ts";
import { alt, char, tuple } from "./_base.ts";

export const commas = tuple(mightbespace, char(','), mightbespace)
export const colons = tuple(mightbespace, char(';'), mightbespace)
export const commasorspace = alt(commas, colons)