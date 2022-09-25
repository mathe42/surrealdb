import { alt, many, ParserFn, tag, take_u64, tuple } from "./_base.ts";

const part = take_u64;
const unit = alt(
  tag("ns"),
  tag("µs"),
  tag("ms"),
  tag("s"),
  tag("m"),
  tag("h"),
  tag("d"),
  tag("w"),
  tag("y"),
)

const duration_rawParser = tuple(part, unit)
export const duration_raw: ParserFn = (sql, offset) => {
  const res = duration_rawParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'duration',
    value: {
      value: res.sub![0].data,
      unit: res.sub![1].found
    },
    position: res.position,
    length: res.length
  }


  return res
}

const durationParser = many(duration_raw)
export const duration: ParserFn = (sql, offset) => {
  const res = durationParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'durationSum',
    value: res.data,
    position: res.position,
    length: res.length
  }


  return res
}