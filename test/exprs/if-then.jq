def while(cond; update):
  def _while:
    if cond
    then
      ., (update | _while)
    else
      empty
    end
  ;
  _while;
def select(f): if f then . else empty end;
if . == 0 then "zero" elif . == 1 then "one" else "many" end
