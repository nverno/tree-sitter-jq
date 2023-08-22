def debug($msgs):
 (
   $msgs
   | debug
   | empty
 ),
   .
;

1 as $x |
  2
  | debug("Entering function foo\(
    "a\(
      "nested interpolation"
    )bc") with $x == \(
      .+
        # comment in a string :D
        $x / 2 * 1 //
        .[]
    )",
    .
  ) | 
    .+1
