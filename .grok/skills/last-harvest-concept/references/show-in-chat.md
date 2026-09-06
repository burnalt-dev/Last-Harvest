# Show concept art where Ivan can see it

Ivan is on **Grok chat + live preview**. He has no `/workspace`. `view_image` is **agent only**.

## Solace (3D)

1. Put the variant in `solace3d/kit.ts` (or a kit index).
2. `npm run concept:sheet` (preview `:8080`) → SENW + isolate PNGs.
3. Final chat message: **`render_file`** those PNGs + numbered picks.
4. Tell him **Title → Concepts** shows the same current pass. **3D Bay** is the live turntable.

## Foes / Gasket 2D

Same as before: save PNG, `render_file`, numbered list. Not `p###`.

## Must not

- Prompt-only
- Rely on `view_image`
- `render_searched_image`
- Packing `p###`
- “See Concepts on the title”
