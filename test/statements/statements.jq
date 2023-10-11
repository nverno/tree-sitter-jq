# import... => [ERROR]: import before module
module {

};                                         # mdmdmdm
# module{}; # [ERROR]: only one module declaration
# def a: 0; # [ERROR]: def before import
include "b"{search: "."};
import "a"
  as
  A
;

import "b" as B {
  search: "."
}
;

A::a
