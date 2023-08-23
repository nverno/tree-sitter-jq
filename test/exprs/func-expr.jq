. as $all |
  def calc($m):
    $all[$m] | (select(length == 1)[0] | tonumber) //
      (first, last) |= calc(.) | {
        "+": (first + last), "-": (first - last),
        "*": (first * last), "/": (first / last),
        "=": first,
      }[.[1]]
    ;
  . | calc("humn")
