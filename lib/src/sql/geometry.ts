import { mightbespace } from "./comment.ts";
import { commas } from "./common.ts";
import {
  alt,
  char,
  double,
  getDataIndex,
  ParserFn,
  resolve,
  seperatedList,
  tag,
  tuple,
} from "./_base.ts";

const quotedTag = (tagName: string, noUnquoted = true) =>
  tuple(
    alt(
      ...(noUnquoted ? [] : [tag(tagName)]),
      tuple(char('"'), tag(tagName), char('"')),
      tuple(char("'"), tag(tagName), char("'")),
    ),
    mightbespace,
    char(":"),
    mightbespace,
  );

const key_geom = quotedTag("geometries", false);
const key_vals = quotedTag("coordinates", false);
const key_type = quotedTag("type", false);
const collection_type = quotedTag("GeometryCollection");
const multipolygon_type = quotedTag("MultiPolygon");
const multiline_type = quotedTag("MultiLineString");
const mutltipoint_type = quotedTag("MultiPoint");
const polygon_type = quotedTag("Polygon");
const line_type = quotedTag("LineString");
const point_type = quotedTag("Point");

const coordinate = tuple(
  getDataIndex(
    tuple(
      char("["),
      mightbespace,
      double,
    ),
    2,
  ),
  getDataIndex(
    tuple(
      mightbespace,
      char(","),
      mightbespace,
      double,
      mightbespace,
      char("]"),
    ),
    3,
  ),
);

const wrapedVals = (fn: ParserFn) =>
  getDataIndex(
    tuple(
      char("["),
      mightbespace,
      seperatedList(commas, fn),
      mightbespace,
      char("]"),
    ),
    2,
  );

const wrapedObj = (fn: ParserFn) =>
  getDataIndex(
    tuple(
      char("{"),
      mightbespace,
      fn,
      mightbespace,
      char("}"),
    ),
    2,
  );

const point_vals = coordinate;
const line_vals = wrapedVals(coordinate);
const polygon_vals = tuple(
  wrapedVals(line_vals),
  seperatedList(commas, line_vals, true),
);
const multipolygon_vals = wrapedVals(polygon_vals);
const multiline_vals = wrapedVals(line_vals);
const multipoint_vals = wrapedVals(point_vals);

const collection_vals = wrapedVals(resolve(() => geometry));

const multiWrapper = (
  key1: ParserFn,
  value1: ParserFn,
  key2: ParserFn,
  value2: ParserFn,
) =>
  wrapedObj(
    alt(
      getDataIndex(
        tuple(
          key1,
          value1,
          mightbespace,
          char(","),
          mightbespace,
          key2,
          value2,
        ),
        6,
      ),
      getDataIndex(
        tuple(
          key2,
          value2,
          mightbespace,
          char(","),
          mightbespace,
          key1,
          value1,
        ),
        1,
      ),
    ),
  );

const collection = multiWrapper(
  key_type,
  collection_type,
  key_geom,
  collection_vals,
);

const multipolygon = multiWrapper(
  key_type,
  multipolygon_type,
  key_vals,
  multipolygon_vals,
);

const multiline = multiWrapper(
  key_type,
  multiline_type,
  key_vals,
  multiline_vals,
);

const multipoint = multiWrapper(
  key_type,
  mutltipoint_type,
  key_vals,
  multipoint_vals,
);

const polygon = multiWrapper(
  key_type,
  polygon_type,
  key_vals,
  polygon_vals,
);

const line = multiWrapper(
  key_type,
  line_type,
  key_vals,
  line_vals,
);

const point = multiWrapper(
  key_type,
  point_type,
  key_vals,
  point_vals,
);

const simple = tuple(
  getDataIndex(
    tuple(
      char("("),
      mightbespace,
      double,
    ),
    2,
  ),
  getDataIndex(
    tuple(
      mightbespace,
      char(","),
      mightbespace,
      double,
      mightbespace,
      char(")"),
    ),
    3,
  ),
);

const geometryParser = alt(
  simple,
  point,
  line,
  polygon,
  multipoint,
  multiline,
  multipolygon,
  collection,
);
export const geometry: ParserFn = (sql, offset) => {
  const res = geometryParser(sql, offset);

  if (res.type === "error") return res;

  res.data = {
    type: "geoJSON",
    value: res.data,
  };

  return res;
};
