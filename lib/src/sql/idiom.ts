import { all, field, first, graph, index, last, part, thing } from "./part.ts";
import { many, tuple, alt, ParserFn } from "./_base.ts";

const localParser = tuple(first, many(alt(all, index, field), true))
const basicParser = tuple(first, many(alt(all, last, index, field), true))
const paramParser = tuple(first, many(part, true))

function wrapper(fn: ParserFn): ParserFn {
  return (sql, offset) => {
    const res = fn(sql, offset)

    if(res.type === 'error') return res

    res.data = {
      type: 'idiom',
      position: res.position,
      length: res.length,
      value: [
        res.sub![0].data,
        ...res.sub![1].data
      ]
    }

    return res
  }
}

export const local = wrapper(localParser)
export const basic = wrapper(basicParser)
export const param = wrapper(paramParser)

const idiomAParser = tuple(
  alt(thing, graph),
  many(part, false)
)

const idiomBParser = tuple(
  alt(first, graph),
  many(part, false)
)

const idiomParser = alt(idiomAParser, idiomBParser)

export const idiom: ParserFn = (sql, offset) => {
  const res = idiomParser(sql, offset)

  if(res.type === 'error') return res

  res.data = {
    type: 'idiom',
    position: res.position,
    length: res.length,
    value: [
      res.sub![0].data,
        ...res.sub![1].data
    ]
  }

  return res
}
