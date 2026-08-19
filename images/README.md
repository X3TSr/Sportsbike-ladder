# Model photos

Photos are **convention over configuration**. Drop a file at the path below and it
appears on that model's card. No code or data change is needed.

```
images/<brand>/<id>.jpg
```

`MANIFEST.txt` lists the exact expected path for all 130 models. To override a path
or use a different extension, set `img` on the bike in `scripts/data/<brand>.js`:

```js
{n:"R125", cat:"sport", img:"images/yamaha/r125.webp", …}
```

A missing file is not an error. The card removes the `<img>` and shows a kerb-patterned
placeholder carrying the brand and engine instead, so the layout stays intact
whether you fill in none, some, or all of them.

## Why this folder is empty

The photos are not included. Two reasons, and both matter:

**1. They could not be fetched here.** The environment this was built in blocks all
outbound network access — every host returns `403` at the proxy, including the
manufacturer sites and every image CDN. Nothing could be downloaded.

**2. Official press photos are copyrighted.** Manufacturer product and press images
are licensed for press and dealer use, not for republication on a third-party site.
Committing them to a public repository is a licensing decision that belongs to
whoever owns this project, not something to do silently. If this stays private or
personal, the practical risk is low; if it is published, it is worth being deliberate.

## Suggested sources

In rough order of how safe they are to publish:

| Source | Licence | Notes |
| --- | --- | --- |
| Your own photographs | Yours | Best option. No ambiguity. |
| Wikimedia Commons | CC BY-SA / CC BY mostly | Check each file. Attribution required — see below. |
| Manufacturer press rooms | Press use, varies | Most require registration and grant press use only. Read the terms. |
| Manufacturer product pages | All rights reserved | Hotlinking also steals bandwidth and breaks when URLs change. Avoid. |

If you use anything requiring attribution, add a credit line. The card has a natural
slot for it — add a `credit` field to the bike and render it under the photo.

## Format

- **Aspect ratio 16:9.** The slot is `aspect-ratio:16/9` with `object-fit:cover`, so
  other ratios crop from the centre rather than distort.
- **Around 800×450** is plenty. Cards are at most ~560 px wide.
- **JPEG or WebP.** WebP is roughly 30% smaller at the same quality; if you use it,
  either rename to `.jpg` or set the `img` override.
- Images are `loading="lazy"`, so a brand page with 25 photos only fetches what
  scrolls into view.
