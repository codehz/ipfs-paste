backend = document.query-selector \#backend-selector
template = document.query-selector \#content-template
content = document.query-selector \#content
dialog = document.query-selector \#dialog

document.add-event-listener \click ({ target }) ->
  | target.matches \#more => append-card!
  | target.matches \.btn-delete => remove-card target.closest \.card
  | target.matches \#upload => upload target

document.body.add-event-listener \dragover (e) ->
  e.stop-propagation!
  e.prevent-default!
document.body.add-event-listener \drop (e) ->
  e.stop-propagation!
  e.prevent-default!
  switch
  | e.target.matches \.editarea => on-drop e

append-card!

const decoder = new TextDecoder!

function random-name
  Math.random!
  .to-string 36
  .substring 7

function append-card (name = random-name!)
  template.content.clone-node true .first-child
  |>content.append-child _
    ..scroll-into-view!
    ..query-selector \.filename
      ..focus!
      ..value = "#name"

!function remove-card card
  card.remove!
  unless content.has-child-nodes!
    append-card!

function extract-card card
  path: card.query-selector \.filename .value
  content: card.content ? card.query-selector \.editarea .text-content

function get-contents
  [...content.children].map extract-card

!async function upload target
  return if target.disabled
  target.disabled = true
  try
    client = IpfsHttpClientLite backend.value
    contents = get-contents!
    arr = await client.add contents, do
      cid-version: 1
      cid-base: "base58btc"
      trickle: true
      wrap-with-directory: true
    location.href = "/ipfs/#{arr.pop!.hash}"
  catch
    dialog.query-selector \.reason
      ..text-content = e + ""
    dialog.show-modal!
    console.error e
    delete! target.disabled

async function async-generate (it, cb)
  done = false
  until done
    { value, done } = await it.next!
    await cb value

async function add-file handle
  file = await handle.get-file!
  content = new Uint8Array await file.array-buffer!
  console.log content
  text = decoder.decode content if is-utf8 content
  append-card handle.name
    ..content = content
    ..query-selector \.editarea
      ..content-editable = !!text
      ..text-content = text ? "(binary data)"
      ..class-list.add "external" if !text

!async function on-drop (e)
  added = false
  handles = await Promise.all do
    Array.from e.data-transfer.items
      .map (item) -> item.get-as-file-system-handle!
  for handle in handles
    added = true
    switch handle.kind
    | \file => await add-file handle
  e.target.closest \.card .remove! if added

function is-utf8 data
  i = 0
  const len = data.length
  while i < len
    if data[i] <= 127
      i++
      continue
    if data[i] >= 194 and data[i] <= 223
      if data[i + 1] .>>. 6 == 2
        i += 2
        continue
      else
        return false
    if (data[i] == 224 and 160 <= data[i + 1] <= 191 or data[i] == 237 and 128 <= data[i + 1] <= 159) and data[i + 2] .>>. 6 == 2
      i += 3
      continue
    if (225 <= data[i] <= 236 or 238 <= data[i] <= 239) and data[i + 1] .>>. 6 == 2 and data[i + 2] .>>. 6 == 2
      i += 3
      continue
    if (data[i] == 240 and 144 <= data[i + 2] <= 191 or 241 <= data[i] <= 243 and data[i + 1] .>>. 6 == 2 or data[i] == 224 and 128 <= data[i + 1] <= 143) and data[i + 2] .>>. 6 == 2 and data[i + 3] .>>. 6 == 2
      i += 4
      continue
    return false
  return true