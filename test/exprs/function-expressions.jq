module{};

def plus(a; b): a + b;

# Should be parsed as: . | (y-((y*x)/y)) + (.*=2|.*_a|.+5)
def a(x; $y):
  . | $y - $y * x / $y +
    def _a:
      def _c(s):
        s * 2
          | s + 1;
      def _b: . | . + 1;
      _c(. | _b) |
        (. as $c
          | { "_a out": $c } |
            debug
          | $c)
    ;
    . *= 2 | (. as $c | { "_a in" : $c } | debug | $c) 
      | . * _a | (. as $c | { "_a in x _a out" : $c } | debug | $c) 
      | . + 5
;

. | ., (.+1|.), .+2 | a(.; 15)
