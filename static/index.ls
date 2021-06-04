backend = document.query-selector \#backend-selector
template = document.query-selector \#content-template
content = document.query-selector \#content

!function append-card
  node = template.content.cloneNode true .first-child
  content.append-child node .scroll-into-view do
    behavior: \smooth

!function remove-card card
  card.remove!
  unless content.has-child-nodes!
    append-card!

append-card!

document.add-event-listener \click (e) ->
  target = e.target
  switch
  | target.matches \#more => append-card!
  | target.matches \.btn-delete => remove-card target.closest \.card
