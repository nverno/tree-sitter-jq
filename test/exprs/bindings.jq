# note: in '$ x', spaces after '$' are ignored
. + .bar as $ x | .  foo | . + $    x | debug |
  . as $i|[(.*2|. as $i| $i), $i] |
  . as [$a, $b, {c: $c}] | $a + $b + $c |
  .[] as [$a, $b] | {a: $a, b: $b}
