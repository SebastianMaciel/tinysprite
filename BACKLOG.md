# TinySprite — backlog

Ideas que surgen en la conversación y se difieren a capítulos futuros.

## History timeline flotante

Floating bottom bar con thumbnails chiquitos de cada snapshot del history.

- Renderizar cada entrada de `history[]` a un thumbnail PNG (data URL) usando un canvas offscreen del tamaño real del sprite.
- Mostrar los thumbnails en una bar flotante en el bottom del viewport (encima del `.hint`), scroll horizontal si hay más que los que entran.
- En hover sobre un thumbnail: previsualizar ese estado en el canvas principal (sin commit, solo render temporal).
- Click: hace jump al estado seleccionado (equivalente a múltiples undo/redo).
- El thumbnail correspondiente al `historyIndex` actual queda destacado.

Beneficios:
- Volver muchos pasos atrás sin spamear `⌘Z`.
- Ver visualmente la evolución del sprite.

Va como feature de un capítulo futuro (probablemente después del export). Idea original: Seba, 2026-06-21.

## User-select: none en UI no textual

Auditar todos los componentes UI no-textuales y aplicar `user-select: none`:

- Toolbar (brand, meta, chips, botones)
- Sidebar (headers de palette, hex label del color activo, botones)
- Swatches (ya tienen pero verificar)
- Labels de inputs (no los inputs en sí)
- Modal header
- Hint footer

Mantener seleccionable: cualquier valor editable (inputs, textareas, contenteditable). El canvas no afecta porque es un elemento `<canvas>` (no es texto). Idea original: Seba, 2026-06-21.
