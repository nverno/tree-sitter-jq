def f(i):
  {x: null, e: false} as $init
  | foreach i as $i
            ($init
             ; if .e then $init else . end
              | if $i | length == 2
                then
                  setpath(["e"]; $i[0]|length==0)
                  | setpath(["x"]+$i[0]; $i[1])
                else
                  setpath(["e"]; $i[0]|length==1)
                end
             ; if .e then .x else empty end
            )
;
foreach . as $item (0; . + $item)
  |  foreach . as $item (0; . + $item; .)
  | @sh
