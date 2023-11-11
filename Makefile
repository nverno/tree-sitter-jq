SHELL = /bin/bash

.PHONY: build test run
build: parser/jq.so

run: test                    ## Run tree-sitter playground with web UI
	npm run web

test:                        ## Run tests in corpus
	@npm run test

install:
	@npm --loglevel=warn --progress=true install
	@npm run build

parser/jq.so: src/parser.c ## Compile parser shared library
	$(RM) $@
	mkdir -p parser
	$(CC) -o $@ -Isrc $^ -shared -fPIC -Os

libtree-sitter-jq.so: src/parser.c
	$(CC) -fPIC -c -Isrc src/parser.c
	$(CC) -fPIC -shared -o $@ *.o

.PHONY: clean distclean
clean:
	$(RM) -r *~ *.core *.o *.out *.exe

distclean: clean
	$(RM) -rf $$(git ls-files --others --ignored --exclude-standard)
