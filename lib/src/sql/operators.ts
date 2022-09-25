import { mightbespace, shouldbespace } from "./comment.ts";
import { tuple, alt, map, tag_no_case, tag, char } from "./_base.ts";

export const phrases = tuple(
  shouldbespace,
  alt(
		alt(
			map(tag_no_case("&&"), {type: 'operator', value: 'And'}),
			map(tag_no_case("AND"), {type: 'operator', value: 'And'}),
			map(tag_no_case("||"), {type: 'operator', value: 'Or'}),
			map(tag_no_case("OR"), {type: 'operator', value: 'Or'}),
		),
		alt(
			map(tag_no_case("IS NOT"), {type: 'operator', value: 'NotEqual'}),
			map(tag_no_case("IS"), {type: 'operator', value: 'Equal'}),
		),
		alt(
			map(tag_no_case("CONTAINSALL"), {type: 'operator', value: 'ContainAll'}),
			map(tag_no_case("CONTAINSANY"), {type: 'operator', value: 'ContainAny'}),
			map(tag_no_case("CONTAINSNONE"), {type: 'operator', value: 'ContainNone'}),
			map(tag_no_case("CONTAINSNOT"), {type: 'operator', value: 'NotContain'}),
			map(tag_no_case("CONTAINS"), {type: 'operator', value: 'Contain'}),
			map(tag_no_case("ALLINSIDE"), {type: 'operator', value: 'AllInside'}),
			map(tag_no_case("ANYINSIDE"), {type: 'operator', value: 'AnyInside'}),
			map(tag_no_case("NONEINSIDE"), {type: 'operator', value: 'NoneInside'}),
			map(tag_no_case("NOTINSIDE"), {type: 'operator', value: 'NotInside'}),
			map(tag_no_case("INSIDE"), {type: 'operator', value: 'Inside'}),
			map(tag_no_case("OUTSIDE"), {type: 'operator', value: 'Outside'}),
			map(tag_no_case("INTERSECTS"), {type: 'operator', value: 'Intersects'}),
		),
	),
  shouldbespace
)

export const symbols = tuple(
  mightbespace,
	alt(
		alt(
			map(tag("=="), {type: 'operator', value: 'Exact'}),
			map(tag("!="), {type: 'operator', value: 'NotEqual'}),
			map(tag("*="), {type: 'operator', value: 'AllEqual'}),
			map(tag("?="), {type: 'operator', value: 'AnyEqual'}),
			map(char('='), {type: 'operator', value: 'Equal'}),
		),
		alt(
			map(tag("!~"), {type: 'operator', value: 'NotLike'}),
			map(tag("*~"), {type: 'operator', value: 'AllLike'}),
			map(tag("?~"), {type: 'operator', value: 'AnyLike'}),
			map(char('~'), {type: 'operator', value: 'Like'}),
		),
		alt(
			map(tag("<="), {type: 'operator', value: 'LessThanOrEqual'}),
			map(char('<'), {type: 'operator', value: 'LessThan'}),
			map(tag(">="), {type: 'operator', value: 'MoreThanOrEqual'}),
			map(char('>'), {type: 'operator', value: 'MoreThan'}),
		),
		alt(
			map(char('+'), {type: 'operator', value: 'Add'}),
			map(char('-'), {type: 'operator', value: 'Sub'}),
			map(char('*'), {type: 'operator', value: 'Mul'}),
			map(char('×'), {type: 'operator', value: 'Mul'}),
			map(char('∙'), {type: 'operator', value: 'Mul'}),
			map(char('/'), {type: 'operator', value: 'Div'}),
			map(char('÷'), {type: 'operator', value: 'Div'}),
		),
		alt(
			map(char('∋'), {type: 'operator', value: 'Contain'}),
			map(char('∌'), {type: 'operator', value: 'NotContain'}),
			map(char('∈'), {type: 'operator', value: 'Inside'}),
			map(char('∉'), {type: 'operator', value: 'NotInside'}),
			map(char('⊇'), {type: 'operator', value: 'ContainAll'}),
			map(char('⊃'), {type: 'operator', value: 'ContainAny'}),
			map(char('⊅'), {type: 'operator', value: 'ContainNone'}),
			map(char('⊆'), {type: 'operator', value: 'AllInside'}),
			map(char('⊂'), {type: 'operator', value: 'AnyInside'}),
			map(char('⊄'), {type: 'operator', value: 'NoneInside'}),
		),
	),
  mightbespace,
)

export const operator = alt(symbols, phrases)

export const assigner = alt(
  map(char('='), {type: 'operator', value: 'Equal'}),
  map(tag("+="), {type: 'operator', value: 'Inc'}),
  map(tag("-="), {type: 'operator', value: 'Dec'}),
)
