document.query-selector-all \code
  .for-each (e) ->
    hljs.highlight-element e
    hljs.line-numbers-block e

document.query-selector-all \.card-body.overflow-x
  .for-each (e) ->
    OverlayScrollbars e, do
      class-name: \os-theme-thin
      padding-absolute: false
      native-scrollbars-overlaid:
        initialize: false
      overflow-behavior:
        x: \scroll
        y: \hidden
