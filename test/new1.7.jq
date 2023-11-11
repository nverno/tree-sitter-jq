# pick(stream)
def f(_stream):
  {"a": 1, "b": {"c": 2, "d": 3}, "e": 4} 
    | pick(.a, .b.c, .x);


# debug(msgs)
def dbg(_):
  1 as $x | 2 | debug("Entering function foo with $x == \($x)", .) | (.+1);

def ddbg:
  {a: 1, b: 2, c: 3} | debug({a, b, sum: (.a+.b)});

# scan($re; $flags)
def _scan:
  "abAB" | scan("ab"; "i");

# Allows 'if' and 'elif' without 'else' branch
def _no_else:
  1,2 | if . == 1 then "one" end |
    1,2 | if . == 1 then "one" else . end |
      1,2,3 | if . == 1 then "one" elif . == 2 then "two" end;

# Allow use of $binding as key in object literals
def _binding_as_key:
  "a" as $key | {$key: 123} //
    "a" as $key | {($key): 123};

# Allow '.' between chained indexes using .["index"];
def _dot_chained:
  {"a": {"b": 123}} | .a["b"] | 
    # FIXME: .a.["b"] now has extra empty (field_id)
    {"a": {"b": 123}} | .a.["b"];

# Allow dot for chained value iterator .[], .[]?
def _dot_chained_iter:
  {"a": [123]} | .a[] |
    {"a": [123]} | .a.[]?;

# Fix deletion using assigning empty against arrays
def _fix2133:
  [1,5,3,0,7] | (.[] | select(. >= 2)) |= empty;

# Allow using nan as NaN in JSON
# https://github.com/jqlang/jq/pull/2712

# Expose a module's function names in modulemeta
# https://github.com/jqlang/jq/pull/2837
