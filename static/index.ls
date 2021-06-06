backend = document.query-selector \#backend-selector
template = document.query-selector \#content-template
content = document.query-selector \#content

document.add-event-listener \click ({ target }) ->
  | target.matches \#more => append-card!
  | target.matches \.btn-delete => remove-card target.closest \.card
  | target.matches \#upload => upload!

append-card!

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
  path: card.query-selector \.filename .value
  content: card.query-selector \.editarea .text-content

function get-contents
  [...content.children].map extract-card

!async function upload
  client = IpfsHttpClientLite backend.value
  contents = get-contents!
  arr = await client.add contents, do
    cid-version: 1
    trickle: true
    wrap-with-directory: true
  location.href = "/ipfs/#{arr.pop!.hash}"