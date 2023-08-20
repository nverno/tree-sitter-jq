module.exports = grammar({
  name: 'jq',

  // name of token matching keywords
  word: $ => $.keyword,

  // Tokens that can appear anywhere (comments/whitespace)
  extras: $ => [
    /\s+/,
    $.comment
  ],

  // Replace usages w/ their definitions
  inline: $ => [
    $.import_statement,
    $.include_statement,
    $.parameter,
    $.constant,
    $.expression,
    $.primary_expression,
    $._ident,
  ],

  // JQ parser.y precedence
  // -----------------------------------
  // %precedence FUNCDEF
  // %right '|'
  // %left ','
  // %right "//"
  // %nonassoc '=' SETPIPE SETPLUS SETMINUS SETMULT SETDIV SETMOD SETDEFINEDOR
  // %left OR
  // %left AND
  // %nonassoc NEQ EQ '<' '>' LESSEQ GREATEREQ
  // %left '+' '-'
  // %left '*' '/' '%'
  // %precedence NONOPT /* non-optional; rules for which a specialized
  //                       '?' rule should be preferred over Exp '?' */
  // %precedence '?'
  // %precedence "try"
  // %precedence "catch"

  // parse precedence: decreasing precedence order
  precedences: $ => [
    [
      'try_catch',
      'member',                                   // []
      'call',                                     // fn()
      'dot',                                      // .
      'unary',                                    // - +
      'binary_times',                             // * / %
      'binary_plus',                              // + -
      'binary_compare',                           // != == < > <= >=
      'binary_and',                               // %left 'and'
      'binary_or',                                // %left 'or'
      $.assignment_expression,                    // = |= += -= *= /= %= //=
      'alternative',                              // %right ... // ...
      $.sequence_expression,                      // %left  ... , ...
      'pipeline',                                 // ... | ...
      'funcdef',
    ],
    [$.assignment_expression, $.primary_expression],
    ['member', 'call', $.expression],
  ],

  // LR(1) conflicts
  // conflicts: $ => [],
  // token names from custom external scanner
  // externals: $ => [],

  // hidden rule names to be considered supertypes in generated node types file
  // supertypes: $ => [],

  rules: {
    // The root node of the grammar.
    program: $ => seq(
      optional($.module),
      field("imports", seq(
        repeat($.include_statement),
        repeat($.import_statement)
      )),
      choice(
        seq(repeat1($.function_definition), optional($.expression)),
        $.expression,
      )),

    // ---------------------------------------------------------------
    /// Modules, Imports, Includes

    module: $ => seq(
      "module",
      optional($.metadata),
      ';'
    ),

    metadata: $ => seq(
      "{",
      // TODO: constant pair list
      "}"
    ),

    _import_statements: $ => choice(
      $.import_statement,
      $.include_statement,
    ),
    
    import_statement: $ => seq(
      'import',
      field('source', $.string),
      'as',
      field('name', $._ident),
      optional($.metadata),
      ';'
    ),

    include_statement: $ => seq(
      'include',
      field('source', $.string),
      optional($.metadata),
      ';'
    ),

    // ---------------------------------------------------------------
    /// Functions

    function_definition: $ => prec.right('funcdef', seq(
      "def",
      field('name', $.identifier),
      field('parameters', optional($.parameter_list)), ":",
      field('body', $.expression),
      ';'
    )),

    parameter: $ => field('name', $._ident),

    parameter_list: $ => seq("(", semiSep($.parameter), ")"),

    _ident: $ => choice($.identifier, $.variable),

    // ---------------------------------------------------------------
    /// Expressions 

    expression: $ => choice(
      $.function_expression,
      $.primary_expression,
      $.binary_expression,
      $.assignment_expression,
      $.unary_expression,
      $.parenthesized_expression,
      $.pipeline,
      $.call_expression,
      $.binding_expression,
      $.sequence_expression,
    ),

    function_expression: $ => prec.right(-2, seq(
      repeat1($.function_definition),
      field("expression", $.expression),
    )),

    primary_expression: $ => choice(
      alias('.', $.stream),
      alias('..', $.recurse),
      $.constant,
      $.identifier,
      $.variable,
      $.break_expr,
      // TODO:
      // $.subscript_expression,
      // $.object,
      // $.array,
    ),

    pipeline: $ => prec.right('pipeline', seq(
      $.expression,
      '|',
      $.expression,
    )),

    break_expr: $ => seq('break', $.variable),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    binding_expression: $ => seq(
      field("value", $.expression),
      'as',
      field('variable', $._ident),
    ),

    call_expression: $ => prec('call', seq(
      field('function', $._ident),
      field('arguments', $._arguments),
    )),

    _arguments: $ => seq(
      '(',
      semiSep($.expression),
      ')',
    ),

    sequence_expression: $ => prec.left(seq(
      field('left', $.expression),
      ',',
      field('right', choice($.sequence_expression, $.expression)),
    )),

    // XXX: postfix '?' as prec.right unary?
    unary_expression: $ => prec.left('unary', seq(
      field('operator', choice('+', '-')),
      field('argument', $.expression),
    )),

    binary_expression: $ => choice(...[
      ['and', 'binary_and'],
      ['or', 'binary_or'],
      ['!=', 'binary_compare'],
      ['==', 'binary_compare'],
      ['<', 'binary_compare'],
      ['>', 'binary_compare'],
      ['<=', 'binary_compare'],
      ['>=', 'binary_compare'],
      ['+', 'binary_plus'],
      ['-', 'binary_plus'],
      ['*', 'binary_times'],
      ['/', 'binary_times'],
      ['%', 'binary_times'],
      ['//', 'alternative', 'right'],
    ].map(([operator, precedence, assoc]) =>
      (assoc === 'right' ? prec.right : prec.left)(precedence, seq(
        field('left', $.expression),
        field('operator', operator),
        field('right', $.expression),
      ))
    )),

    assignment_expression: $ => prec.right(seq(
      field('left', $.expression),
      field('operator', choice("|=", "+=", "-=", "*=", "/=", "//=", "%=", "=")),
      field('right', $.expression),
    )),

    // object: $ => prec('object', seq(
    //   '{',
    //   commaSep(optional(
    //     $.pair,
    //     // $.spread_element,
    //     // $.method_definition,
    //     // alias(
    //     //   choice($.identifier, $._reserved_identifier),
    //     //   $.shorthand_property_identifier
    //     // )
    //   )),
    //   '}'
    // )),

    // pair: $ => seq(
    //   field('key', $._property_name),
    //   ':',
    //   field('value', $.expression)
    // ),

    // _property_name: $ => choice(
    //   $.string,
    //   $.parenthesized_expression,
    // ),

    // optional_chain: $ => '?',

    // array: $ => seq(
    //   '[',
    //   // commaSep(optional(choice(
    //   //   $.expression,
    //   // ))),
    //   ']'
    // ),

    // // object[...]
    // subscript_expression: $ => prec.right('member', seq(
    //   field('object', choice($.expression)),
    //   '[', field('index', $.expression), ']'
    // )),

    // FIXME: separate <module_name>::<function_name> ?
    identifier: $ => /([a-zA-Z_][a-zA-Z_0-9]*::)*[a-zA-Z_][a-zA-Z_0-9]*/,

    variable: $ => /\$[a-zA-Z_][a-zA-Z_0-9]*/,

    // Constants
    constant: $ => choice(
      $.true,
      $.false,
      $.null,
      $.number,
      $._format,
    ),

    // TODO: Number formats allowed?
    number: $ => /\d+/,
    true: $ => 'true',
    false: $ => 'false',
    null: $ => 'null',
    _format: $ => /"@"[a-zA-Z0-9_]+/,

    // _field: $ => /\.[a-zA-Z_][a-zA-Z_0-9]*/,
    // _field_access: $ => seq('.', $.identifier),

    keyword: $ => /module|import|include|def|as|if|then|else|elif|end|and|or|reduce|foreach|try|catch|label|break|__loc__/,

    comment: $ => token(prec(-1, /#.*/)),

    // ---------------------------------------------------------------
    /// Strings

    // TODO: strings
    string: $ => /"[^"]*"/,
    // string: $ => choice(
    //   seq('"', $._qqstring, '"'),
    //   seq($._format, '"', $._qqstring, '"')
    // ),
  }
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function semiSep(rule) {
  return optional(sep1(rule, ';'));
}

function commaSep(rule) {
  return optional(sep1(rule, ','));
}
