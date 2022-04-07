use crate::sql::idiom::Idiom;
use crate::sql::operation::{Op, Operation};
use crate::sql::value::Value;
use std::cmp::min;

impl Value {
	pub fn diff(&self, val: &Value, path: Idiom) -> Vec<Operation> {
		let mut ops: Vec<Operation> = vec![];
		match (self, val) {
			(Value::Object(a), Value::Object(b)) if a != b => {
				// Loop over old keys
				for (key, _) in a.value.iter() {
					if !b.value.contains_key(key) {
						ops.push(Operation {
							op: Op::Remove,
							path: path.clone().add(key.clone().into()),
							value: Value::Null,
						})
					}
				}
				// Loop over new keys
				for (key, val) in b.value.iter() {
					match a.value.get(key) {
						None => ops.push(Operation {
							op: Op::Add,
							path: path.clone().add(key.clone().into()),
							value: val.clone(),
						}),
						Some(old) => {
							let path = path.clone().add(key.clone().into());
							ops.append(&mut old.diff(val, path))
						}
					}
				}
			}
			(Value::Array(a), Value::Array(b)) if a != b => {
				let mut n = 0;
				while n < min(a.len(), b.len()) {
					let path = path.clone().add(n.into());
					ops.append(&mut a.value[n].diff(&b.value[n], path));
					n += 1;
				}
				while n < b.len() {
					if n >= a.len() {
						ops.push(Operation {
							op: Op::Add,
							path: path.clone().add(n.into()),
							value: b.value[n].clone(),
						})
					}
					n += 1;
				}
				while n < a.len() {
					if n >= b.len() {
						ops.push(Operation {
							op: Op::Remove,
							path: path.clone().add(n.into()),
							value: Value::Null,
						})
					}
					n += 1;
				}
			}
			(Value::Strand(a), Value::Strand(b)) if a != b => ops.push(Operation {
				op: Op::Change,
				path,
				value: {
					let mut dmp = dmp::new();
					let mut pch = dmp.patch_make1(&a.value, &b.value);
					let txt = dmp.patch_to_text(&mut pch);
					txt.into()
				},
			}),
			(a, b) if a != b => ops.push(Operation {
				op: Op::Replace,
				path,
				value: val.clone(),
			}),
			(_, _) => (),
		}
		ops
	}
}

#[cfg(test)]
mod tests {

	use super::*;
	use crate::sql::array::Array;
	use crate::sql::test::Parse;

	#[test]
	fn diff_none() {
		let old = Value::parse("{ test: true, text: 'text', other: { something: true } }");
		let now = Value::parse("{ test: true, text: 'text', other: { something: true } }");
		let res = Array::parse("[]");
		assert_eq!(res.to_operations().unwrap(), old.diff(&now, Idiom::default()));
	}

	#[test]
	fn diff_add() {
		let old = Value::parse("{ test: true }");
		let now = Value::parse("{ test: true, other: 'test' }");
		let res = Array::parse("[{ op: 'add', path: '/other', value: 'test' }]");
		assert_eq!(res.to_operations().unwrap(), old.diff(&now, Idiom::default()));
	}

	#[test]
	fn diff_remove() {
		let old = Value::parse("{ test: true, other: 'test' }");
		let now = Value::parse("{ test: true }");
		let res = Array::parse("[{ op: 'remove', path: '/other' }]");
		assert_eq!(res.to_operations().unwrap(), old.diff(&now, Idiom::default()));
	}

	#[test]
	fn diff_add_array() {
		let old = Value::parse("{ test: [1,2,3] }");
		let now = Value::parse("{ test: [1,2,3,4] }");
		let res = Array::parse("[{ op: 'add', path: '/test/3', value: 4 }]");
		assert_eq!(res.to_operations().unwrap(), old.diff(&now, Idiom::default()));
	}

	#[test]
	fn diff_replace_embedded() {
		let old = Value::parse("{ test: { other: 'test' } }");
		let now = Value::parse("{ test: { other: false } }");
		let res = Array::parse("[{ op: 'replace', path: '/test/other', value: false }]");
		assert_eq!(res.to_operations().unwrap(), old.diff(&now, Idiom::default()));
	}

	#[test]
	fn diff_change_text() {
		let old = Value::parse("{ test: { other: 'test' } }");
		let now = Value::parse("{ test: { other: 'text' } }");
		let res = Array::parse(
			"[{ op: 'change', path: '/test/other', value: '@@ -1,4 +1,4 @@\n te\n-s\n+x\n t\n' }]",
		);
		assert_eq!(res.to_operations().unwrap(), old.diff(&now, Idiom::default()));
	}
}
