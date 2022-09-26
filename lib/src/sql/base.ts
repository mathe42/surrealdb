import { alt, map, tag_no_case } from "./_base.ts";

export const base = alt(
  map(alt(tag_no_case("NAMESPACE"), tag_no_case("NS")), {
    type: "base",
    value: "ns",
  }),
  map(alt(tag_no_case("DATABASE"), tag_no_case("DB")), {
    type: "base",
    value: "ns",
  }),
);
