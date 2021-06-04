backend = document.query-selector '#backend-selector'
more_btn = document.query-selector '#more'
upload_btn = document.query-selector '#upload'
template = document.query-selector '#content-template'
content = document.query-selector '#content'

!function append-card
  node = template.content.cloneNode true .first-child
  content.append-child node .scroll-into-view do
    behavior: 'smooth'

append-card!

more_btn.add-event-listener "click", append-card