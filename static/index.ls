backend = document.query-selector \#backend-selector
template = document.query-selector \#content-template
content = document.query-selector \#content

document.add-event-listener \click ({ target }) ->
  | target.matches \#more => append-card!
  | target.matches \.btn-delete => remove-card target.closest \.card
  | target.matches \#upload => upload!

append-card!

OverlayScrollbars document.body, do
  class-name: \os-theme-thin
  padding-absolute: false
  native-scrollbars-overlaid:
    initialize: false
  overflow-behavior:
    x: \hidden
    y: \scroll

function random-name
  Math.random!
  .to-string 36
  .substring 7

!function append-card
  random = random-name!
  template.content.clone-node true .first-child
  |>content.append-child _
    ..scroll-into-view!
    ..query-selector \.filename
      ..focus!
      ..value = "#random.txt"
      ..set-selection-range 0, random.length

!function remove-card card
  card.remove!
  unless content.has-child-nodes!
    append-card!

function extract-card card
  filename: card.query-selector \.filename .value
  content: card.query-selector \.editarea .text-content

function get-contents
  [...content.children].map extract-card

!function upload
  console.log get-contents!