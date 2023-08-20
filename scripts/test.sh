#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
PDIR="$DIR/.."
UDIR="$PDIR/../../src/tree-sitter-jq"
EXE="node_modules/.bin/tree-sitter"

run_test() {
    local root="$PDIR" exe="$PDIR/$EXE" tst
    while (( "$#" )); do
        case "$1" in
            -u) exe="$UDIR/$EXE"
                root="$UDIR"
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

    echo "[RUN] $exe parse $tst $*"
    cd "$root" || exit 1
    npx tree-sitter generate && npx tree-sitter parse "$tst" "$@"
}

"$@"
