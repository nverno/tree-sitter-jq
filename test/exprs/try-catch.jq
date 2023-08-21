try .a catch ". is not an object"
  # [.[]|try .a] |
  | try
      try error("some exception")
      catch error("caught nested")
    catch "caught outer"
  | (. as $c | {".": (.)} | debug | $c)
  | label $l
  | try  
      try
        try
          try .b
          catch error("b")
        catch error("." + .)
      catch ("." + .)
     + "..."
  # | break $l
