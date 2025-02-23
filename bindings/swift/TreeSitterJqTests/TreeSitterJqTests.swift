import XCTest
import SwiftTreeSitter
import TreeSitterJq

final class TreeSitterJqTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_jq())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Jq grammar")
    }
}
