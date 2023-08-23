libtree-sitter-jq.so: src/parser.c
	$(CC) -fPIC -c -Isrc src/parser.c
	$(CC) -fPIC -shared -o $@ *.o
