def range1(init; upto; by):
  def _range1:
    if (by > 0 and . < upto) or (by < 0 and . > upto)
    then ., ((.+by) | _range1)
    else .
    end;
  def tst:
    def _tst: def __tst: .; .;
                            .;
  if by == 0
  then init
  else init | _range1
  end
  | select( (by > 0 and . < upto) or (by < 0 and . > upto))
;

range1(0; 10; 3)
