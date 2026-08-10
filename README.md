# The Ladder

Every manufacturer sells a staircase: a learner bike at the bottom, a flagship at
the top, and a set of compromises in between. This is an interactive look at how
six manufacturers space their rungs — and which ones a given European licence
actually reaches.

Six manufacturers, 102 model lines, six categories, 2026 EU specifications.

## Using it

Open `index.html` in a browser. No build step, no dependencies, no server needed —
it is plain HTML, CSS and JavaScript, and works straight off the filesystem or from
any static host.

Three views:

| View | What it does |
| --- | --- |
| **Picker** | Category chips first, then the six lineups. Each brand tile summarises whichever category is selected. |
| **Brand** | One manufacturer, filterable by category, with a re-sortable ladder, a card per model and a full spec table. |
| **Compare** | All 102 models on one ladder, coloured by brand, with per-model checkboxes plus category and licence filters. |

Both ladders sort by power, 0–100 km/h, top speed, weight or power-to-weight. Rows
slide to their new positions rather than jumping, so you can see what moved.

### Categories

`sport · naked · sport-tourer · adventure · cruiser · retro`

The category selector sits above the brand choice — pick a category on the picker
and it carries into the brand page you open. If a brand doesn't sell into the
selected category, its tile is hidden, and opening a brand that lacks it falls back
to showing everything rather than an empty page.

Sorting all 102 at once is mostly a novelty — a Gold Wing and a Panigale V4 R share
a ladder because they are both motorcycles, not because the comparison means
anything. The category filter is where the useful comparisons live.

## Layout

```
index.html              markup for all three views
styles/
  base.css              design tokens, reset, header, notes, footer
  components.css        chips, brand tiles, ladder, cards, spec table, compare picker
  responsive.css        narrow-screen and reduced-motion overrides (loaded last)
scripts/
  data/
    index.js            category definitions + the registry brands fill
    yamaha.js …         one file per brand, 9–25 model lines each
    derive.js           ptw, id, uid, estimate sets, entry-licence ranking
  metrics.js            the five sort metrics; metric-button wiring
  categories.js         the category chip component, shared by all three views
  ladder.js             the animated bar chart, shared by both ladders
  brand-view.js         picker (chips + brand grid) and the brand page
  compare-view.js       cross-brand selection, filters and ladder
  app.js                view routing, delegated clicks/keyboard, resize
```

Load order matters: each script hangs off a shared `SBL` global, the brand files
must come after `data/index.js` and before `data/derive.js`, and `app.js` runs last.
The stylesheets must stay in the order above, since `responsive.css` overrides the
component defaults.

### How the ladder animates

Rows are built into the DOM once and never reordered. Sorting only rewrites each
row's `translateY`, which is what makes a re-sort slide instead of snap. Filtering
by category hides rows rather than rebuilding them, so switching categories animates
the same way. Row height lives in the `--row-h` custom property so that JS and the
narrow-screen breakpoint cannot disagree about it; a resize re-lays the ladder after
a 150 ms debounce.

### Adding a bike

Add an entry to the relevant `bikes` array in `scripts/data/<brand>.js`, including a
`cat` key from `SBL.CATEGORIES`. `ptw`, `id`, `uid` and the estimate set are derived
at load, and the chips, ladders, cards, spec tables and compare checkboxes all build
themselves from that array — nothing else needs touching.

## About the numbers

Power figures are manufacturer claims measured at the crank; expect roughly 10–15%
less at the rear wheel. Licence classes are European: A1 covers 125cc and 11 kW, A2
caps at 35 kW with a power-to-weight limit, A is unrestricted.

**Estimated figures are marked with a dotted underline** in the ladder, the model
cards and the spec tables. Manufacturers publish power, torque, weight and seat
height for nearly everything, but rarely 0–100 km/h or top speed outside the sport
class — those two fields are derived from power-to-weight for almost every model
here and should be read as a ranking, not a stopwatch.

Weights are kerb/wet **with** fuel. Ducati publishes weight with the tank empty, so
those figures are converted at 0.75 kg per litre of tank capacity; expect a 1–2 kg
margin on that brand.

Compiled August 2026.
