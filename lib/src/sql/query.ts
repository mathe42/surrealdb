import { statements } from "./statement.ts";
import { eof, getDataIndex } from "./_base.ts";

export const query = getDataIndex(statements, eof);
