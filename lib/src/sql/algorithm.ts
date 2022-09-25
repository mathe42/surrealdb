import { alt, ParserFn, tag } from "./_base.ts";

const algorithmParser = alt(
  tag("EDDSA"),
  tag("ES256"),
  tag("ES384"),
  tag("ES512"),
  tag("HS256"),
  tag("HS384"),
  tag("HS512"),
  tag("PS256"),
  tag("PS384"),
  tag("PS512"),
  tag("RS256"),
  tag("RS384"),
  tag("RS512"),
)

export const algorithm: ParserFn = (sql, offset) => {
  const res = algorithmParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'algorithm',
    value: res.found,
    position: res.position,
    length: res.length
  }

  return res
}