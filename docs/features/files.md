# Files

## Purpose

Browse, create, edit, and delete files under WireMock's `__files`
directory — the files stub mappings can reference as response bodies via
`bodyFileName`.

## Prerequisites

An active server (see [Servers](/features/servers)).

## How to access it

Sidebar → **Files**, route `/files`.

## Typical workflow

1. Open **Files**. The left panel shows every file under `__files` as a
   tree (directories first, then files, alphabetically), searchable by
   path.
2. Select a file to view/edit its contents in the right panel.
3. Edit text content directly (Monaco, with syntax highlighting inferred
   from the file extension — JSON, XML, HTML, JS, TS, CSS, YAML,
   Markdown, or plain text) and click **Save**.
4. Click **Delete** to remove a file (with a confirmation dialog).
5. Click **New file** to create one — you'll be prompted for a path; it's
   created empty and opened for editing.

## Referenced-by mappings

Selecting a file shows every mapping whose response uses it as
`bodyFileName`, each linking straight to that mapping's editor — useful
for finding what would break before you edit or delete a file.

## Binary files

Files with a recognized binary extension (images, archives, fonts, audio/
video, compiled binaries, etc.) are listed and can be **deleted**, but are
**not opened in the text editor**. WireMock's files API returns file
content as opaque text with no content-type signal, so decoding binary
bytes as text — and saving them back — would corrupt the file. MockOps
intentionally refuses to do this rather than risk silent corruption;
manage binary file _contents_ directly on the WireMock server's
filesystem, or delete and re-upload through another route.

## Important behavior

- Only files list is polled; content is fetched on selection.
- Unsaved edits show an "Unsaved" badge; there's no unsaved-changes
  navigation guard on this page (unlike the mapping editor).

## Common problems

- **Can't edit an image/archive/font file** — this is by design; see
  Binary files above.
- **Deleted a file a mapping needs** — the confirmation dialog tells you
  how many mappings reference the file before you confirm; check that
  list first.

## Related

[Mappings](/features/mappings) — `bodyFileName` response mode.
