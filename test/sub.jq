# If s contains capture  variables, then create a capture object  and pipe it to
# s, bearing in mind that s could be a stream
def sub($re; s; $flags):
  . as $in
    | (
      reduce match($re; $flags) as $edit
        ({result: [], previous: 0};
        $in[
          .previous: ($edit | .offset)
        ] as $gap
          # create the "capture" objects (one per item in s)
          | [reduce (
            $edit
              | .captures | .[] | select(.name != null)
              | { (.name) : .string }
          ) as $pair ({}; . + $pair) | s
          ] as $inserts
          | reduce range(0; $inserts|length) as $ix (.;
              .result[$ix] += $gap + $inserts[$ix]
          )
          | .previous = ($edit | .offset + .length))
        | .result[] + $in[.previous:]
    )
      // $in;
