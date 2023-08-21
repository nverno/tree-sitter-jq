def debug($msgs): ($msgs | debug | empty), .;
1 as $x | 2 | debug("Entering function foo with $x == \($x)", .) | (.+1)
