module.exports = grammar({
  name: 'jq',

  word: $ => $._identifier,

  // Tokens that can appear anywhere (comments/whitespace)
  extras: $ => [
    /\s+/,
    $.comment
  ],

  // Replace usages w/ their definitions
  inline: $ => [
    $.parameter,
    $.expression,
    $.primary_expression,
    $._ident,
  ],

  // hidden rule names to be considered supertypes in generated node types file
  // supertypes: $ => [],

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
      'member',                                   // .[], .<field>
      'catch',
      'try',
      'optional',                                 // postfix ?
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
    ['array', $.sequence_expression],
  ],

  // LR(1) conflicts
  // conflicts: $ => [],
  // token names from custom external scanner
  // externals: $ => [],

  rules: {
    // The root node of the grammar.
    program: $ => seq(
      optional($.module),
      repeat(choice(
        $.import_statement,
        $.include_statement
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

    metadata: $ => $.object,
    
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

    _expression: $ => choice(
      $.function_expression,
      $.primary_expression,
      $.binary_expression,
      $.unary_expression,
      $.assignment_expression,
      $.pipeline,
      $.binding_expression,
      $.break_expression,
      $.reduce_expression,
      $.label_expression,
      $.foreach_expression,
      $.try_expression,
      $.if_expression,
      $.optional_expression,
    ),

    expression: $ => choice(
      $.sequence_expression,
      $._expression,
    ),

    primary_expression: $ => choice(
      alias('.', $.dot),
      alias('..', $.recurse),
      alias('true', $.true),
      alias('false', $.false),
      alias('null', $.null),
      $.format,
      $.field,
      $.number,
      $.identifier,
      $.variable,
      $.string,
      $.parenthesized_expression,
      $.call_expression,
      $.field_expression,
      $.subscript_expression,
      $.array,
      $.object,
    ),

    function_expression: $ => prec.right(-2, seq(
      repeat1($.function_definition),
      field("expression", $.expression),
    )),

    pipeline: $ => prec.right('pipeline', seq(
      $.expression,
      '|',
      $.expression,
    )),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    optional_expression: $ => prec('optional', seq(
      $.expression,
      '?'
    )),
    
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

    break_expression: $ => seq(
      'break',
      field("label", $.variable),
    ),

    label_expression: $ => seq(
      'label',
      field('name', $.variable),
    ),

    reduce_expression: $ => seq(
      'reduce',
      $.binding_expression,
      '(',
      field('initializer', $.expression), ';',
      field('update', $.expression),
      ')'
    ),
    
    foreach_expression: $ => seq(
      'foreach',
      $.binding_expression,
      '(',
      field('initializer', $.expression), ';',
      field('update', $.expression),
      optional(seq(';', field('extract', $.expression))),
      ')'
    ),

    try_expression: $ => prec.right('try', seq(
      'try',
      field('body', $.expression),
      optional(field('catch', $._catch_expression)),
    )),
    
    _catch_expression: $ => prec('catch', seq(
      'catch',
      $.expression)
                               ),

    if_expression: $ => seq(
      'if',
      field('condition', $.expression),
      'then',
      field('body', $.expression),
      repeat($.elif_expression),
      optional($.else_expression),
      'end'
    ),
    
    elif_expression: $ => seq(
      'elif',
      field('condition', $.expression),
      'then',
      field('body', $.expression),
    ),

    else_expression: $ => seq(
      'else',
      $.expression,
    ),
    
    unary_expression: $ => prec.left('unary', seq(
      field('operator', choice('+', '-')),
      field('argument', $.expression),
    )),

    binary_expression: $ => choice(...[
      [alias('and', $.and), 'binary_and'],
      [alias('or', $.or), 'binary_or'],
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
      [alias('//', $.alternative), 'alternative', 'right'],
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

    binding_expression: $ => seq(
      field("values", $.primary_expression),
      'as',
      field('bindings', $._patterns),
    ),

    _patterns: $ => prec.right(repeatPattern($._pattern)),

    _pattern: $ => prec.right(choice(
      $.variable,
      $.object_pattern,
      $.array_pattern,
    )),

    _object_key: $ => choice(
      $.keyword,
      $.variable,
      $.identifier,
      $.string,
      $.parenthesized_expression,
    ),
    
    pair_pattern: $ => seq(
      field('key', $._object_key),
      ':',
      field('value', $._pattern)
    ),

    // object patterns matched in 'as' {...} bindings
    object_pattern: $ => seq(
      '{',
      commaSep(
        prec.left('member', choice(
          $.variable,
          $.pair_pattern
        ))),
      '}'
    ),
    
    // MkDictPair
    // {
    //   [<str>|<ident>|<var>|<kw>|$__loc__],
    //   [<str>|<ident>|<var>|<kw>|'('Exp')']: expD,
    // }
    pair: $ => seq(
      field('key', $._object_key),
      ':',
      field('value', $.primary_expression)
    ),

    object: $ => seq(
      '{',
      commaSep(
        prec.left('member', choice(
          $.identifier,
          $.variable,
          $.string,
          $.pair,
        ))),
      '}'
    ),

    // array patterns matched in 'as' [...] bindings
    array_pattern: $ => seq(
      '[',
      commaSep(prec.left('member', $._pattern)),
      ']'
    ),

    array: $ => seq(
      '[',
      commaSep(prec.left('member', $._expression)),
      ']'
    ),

    // [:Exp] | [Exp:] | [Exp:Exp]
    slice_expression: $ => choice(
      seq(
        optional(field('start', $.expression)),
        ':',
        field('end', $.expression)
      ),
      seq(
        field('start', $.expression),
        ':',
        optional(field('end', $.expression)),
      )
    ),

    // // PExp '.'? '[' Exp? ']'
    subscript_expression: $ => prec.right('member', seq(
      field('object', $.primary_expression),
      '[',
      choice(
        optional(field('index', $.expression)),
        $.slice_expression,
      ),
      ']',
    )),

    // PExp '.' [<str>|<field>]
    field_expression: $ => prec('member', seq(
      field('object', $.primary_expression),
      field('field', $.field),
    )),

    _identifier: $ => /[a-zA-Z_][a-zA-Z_0-9]*/,

    _qualified_identifier: $ => sep1($._identifier, '::'),

    identifier: $ => $._qualified_identifier,

    variable: $ => seq('$', $._qualified_identifier),

    _field: $ => seq('.', $._identifier),

    field: $ => seq('.', alias(choice($.string, $._identifier), $.name)),

    format: $ => seq('@', field('type', /[a-zA-Z0-9_]+/)),

    number: $ => /[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?/,

    keyword: $ => /module|import|include|def|as|if|then|else|elif|end|and|or|reduce|foreach|try|catch|label|break|__loc__/,

    comment: $ => token(prec(-1, /#.*/)),

    // ---------------------------------------------------------------
    /// Strings

    interpolation: $ => seq('\\(', $._expression, ')'),

    string: $ => seq(
      '"',
      repeat(choice(
        token.immediate(/[^"\\]+/),
        '\\"',
        '\\\\',
        $.interpolation,
      )),
      '"'
    ),
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

function repeatPattern(rule) {
  return sep1(rule, '?//');
}
