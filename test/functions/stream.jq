def tostream:
  path(
    def r:
      (.[]?
        |
        r            
      ), .;
    r
  ) as $p
    | getpath($p)
    |
      reduce
        path(
          .[]?
        ) as
          $q (
        [$p, .];
        [
          $p +
            $q
        ]
      )
    |
        .
;

.
  | tostream
  | (
    . as $stream
      | 1
      | truncate_stream($stream)
  )
