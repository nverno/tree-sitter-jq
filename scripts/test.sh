#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
PDIR="$DIR/.."
UDIR="$PDIR/../../src/tree-sitter-jq"
EXE="node_modules/.bin/tree-sitter"

run_test() {
    local root="$PDIR" tst
    while (( "$#" )); do
        case "$1" in
            -u) root="$UDIR"
                ;;
            -*) echo "unrecognized flag: $1" && exit 1;;
            *) break;;
        esac
        shift || true
    done

    tst="$(realpath "$PDIR/$1")"
    if [[ -z "$1" ]] || [[ ! -f "$1" ]]; then
        echo "missing test/not found: $1"
        exit 1
    fi
    shift

    if [[ ! -x "$root/$EXE" ]]; then
        echo "$root/$EXE" not found
        exit 1
    fi
    cd "$root" || exit 1

    echo "[RUN] $root/$EXE parse $tst $*"
    npx tree-sitter generate && npx tree-sitter parse "$tst" "$@"
}

"$@"
