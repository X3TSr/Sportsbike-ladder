# The Ladder

Every manufacturer sells a staircase: a learner bike at the bottom, a superbike at
the top, and a set of compromises in between. This is an interactive look at how
six sportbike lineups space their rungs — and which ones a given European licence
actually reaches.

Six manufacturers, 32 models, 2026 EU specifications.

## Using it

Open `index.html` in a browser. No build step, no dependencies, no server needed —
it is plain HTML, CSS and JavaScript, and works straight off the filesystem or from
any static host.

Three views:

| View | What it does |
| --- | --- |
| **Picker** | The six lineups, each with its power span and entry licence class. |
| **Brand** | One manufacturer's ladder, re-sortable by five metrics, plus a card per model and a full spec table. |
| **Compare** | All 32 models on one ladder, coloured by brand, with per-model checkboxes and licence-class filters. |

Both ladders sort by power, 0–100 km/h, top speed, weight or power-to-weight. Rows
slide to their new positions rather than jumping, so you can see what moved.

## Layout

```
index.html              markup for all three views
styles/
  base.css              design tokens, reset, header, notes, footer
  components.css        brand tiles, ladder, cards, spec table, compare picker
  responsive.css        narrow-screen and reduced-motion overrides (loaded last)
scripts/
  data.js               the six lineups + derived fields (ptw, id, uid)
  metrics.js            the five sort metrics; metric-button wiring
  ladder.js             the animated bar chart, shared by both ladders
  brand-view.js         picker grid + single-manufacturer page
  compare-view.js       cross-brand selection, filters and ladder
  app.js                view routing, delegated clicks/keyboard, resize
```

Load order matters: each script hangs off a shared `SBL` global and `app.js` runs
last. The stylesheets must stay in the order above, since `responsive.css` overrides
the component defaults.

### How the ladder animates

Rows are built into the DOM once and never reordered. Sorting only rewrites each
row's `translateY`, which is what makes a re-sort slide instead of snap. Row height
lives in the `--row-h` custom property so that JS and the narrow-screen breakpoint
cannot disagree about it; a resize re-lays the ladder after a 150 ms debounce.

### Adding a bike

Add an entry to the relevant `bikes` array in `scripts/data.js`. `ptw`, `id` and
`uid` are derived at load, and the ladders, cards, spec tables and compare
checkboxes all build themselves from that array — nothing else needs touching.

## About the numbers

Power figures are manufacturer claims measured at the crank; expect roughly 10–15%
less at the rear wheel. 0–100 km/h times are converted from published 0–60 mph tests
or estimated from power-to-weight, so treat them as a ranking rather than a
stopwatch. Licence classes are European: A1 covers 125cc and 11 kW, A2 caps at 35 kW
with a power-to-weight limit, A is unrestricted.

Compiled August 2026.
