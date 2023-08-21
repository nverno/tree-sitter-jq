import "./statements/a" as A { search: "." };
{a:1, b: 2}
  | {("a" + "b"): "c"}
  | { a: .b }
  | { a, b }
  | {"user":"stedolan","titles":["JQ Primer", "More JQ"]}
  | {user, title: .titles[]}
  | {(.user): .titles}
  | "f o o" as $foo | "b a r" as $bar | { $foo, ($bar): $foo }
  | {(A::a): "a"}
  | .realnames as $names | .posts[] | {title, author: $names[.author]}
  | {"k": {"a": 1, "b": 2}} * {"k": {"a": 0,"c": 3}}
