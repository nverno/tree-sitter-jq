package tree_sitter_jq_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_jq "github.com/nverno/tree-sitter-jq/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_jq.Language())
	if language == nil {
		t.Errorf("Error loading Jq grammar")
	}
}
