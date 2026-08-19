# The Ladder

Every manufacturer sells a staircase: a learner bike at the bottom, a flagship at
the top, and a set of compromises in between. This is an interactive look at how
seven manufacturers space their rungs — and which ones a given European licence
actually reaches.

Seven manufacturers, 129 model lines, six categories, model years 2020–2026.

## Using it

Open `index.html` in a browser. No build step, no dependencies, no server needed —
it is plain HTML, CSS and JavaScript, and works straight off the filesystem or from
any static host.

Three views:

| View | What it does |
| --- | --- |
| **Picker** | Category chips first, then the seven lineups. Each brand tile summarises whichever category is selected. |
| **Brand** | One manufacturer, filterable by category and year, with a re-sortable ladder, a card per model and a full spec table. |
| **Compare** | All 129 models on one ladder, coloured by brand, with per-model checkboxes plus year, category and licence filters. |

Both ladders sort by power, 0–100 km/h, top speed, weight or power-to-weight. Rows
slide to their new positions rather than jumping, so you can see what moved.

### Categories

`sport · naked · sport-tourer · adventure · cruiser · retro`

The category selector sits above the brand choice — pick a category on the picker
and it carries into the brand page you open. If a brand doesn't sell into the
selected category, its tile is hidden, and opening a brand that lacks it falls back
to showing everything rather than an empty page.

### Model years

`Current · 2026 · 2025 · 2024 · 2023 · 2022 · 2021 · 2020`

Picking a year rewinds the page: models that had not launched drop out, discontinued
ones reappear, and where an earlier generation is on record its specs replace the
current ones. A card showing archived specs is badged with the year and carries a
note on what changed.

**Coverage is deliberately uneven, and the UI says so.** Launch years are set for all
129 models, but prior-generation *specs* exist for 49 of them — the ones where the
figures are actually known, like the 955cc Panigale V2, the Ninja 400 before it became
the 500, and the R 1250 GS. Every other model shows its current figures for each year
it was on sale. The line under the year chips always reports both numbers, so a bike
shown at today's specs is never mistaken for one that genuinely did not change. The
alternative — inventing seven years of numbers for 129 bikes — would make the whole
spec sheet untrustworthy.

#### Comparing a model against its own earlier self

The year chips show one year at a time, so a bike can never sit beside another
version of itself. **Every generation** in the compare view does that instead: each
selected model contributes one row per generation on record, labelled with its year
span, so the 955cc Panigale V2 lines up directly against the 890cc one.

A model showing a single row is one whose earlier specs are *not recorded* — not
necessarily one that never changed. Every model card carries a **Generation** row
giving the span its figures belong to, which is what makes that legible at the point
of use.

The Yamaha R125 is the clearest illustration of why the distinction matters. It used
to show one row here, on a launch year of 2023, which read as *nothing changed*.
Yamaha publishes a spec page per model year, so the real answer turned out to be four
rows: 142 kg in 2020, 144 kg from 2021, the seat down to 820 mm in 2023, and 141 kg
from 2025. The single row was a gap in this project's data, not a fact about the
motorcycle — which is exactly what a missing archive entry always means.

Sorting all 129 at once is mostly a novelty — a Gold Wing and a Panigale V4 R share
a ladder because they are both motorcycles, not because the comparison means
anything. The category filter is where the useful comparisons live.

## Model photos

Photos are convention over configuration — drop a file at `images/<brand>/<id>.jpg`
and it appears on that model's card. Nothing else to change. `images/MANIFEST.txt`
lists the expected path for all 129 models, and `images/README.md` covers formats,
licensing and sources.

**The folder ships empty.** Official press photos could not be fetched (the build
environment blocks all outbound network access) and they are copyrighted in any case,
so bundling them is a licensing decision for whoever owns this project. A missing file
is not an error: the card drops the `<img>` and shows a kerb-patterned placeholder
carrying the brand and engine, so the layout is intact at zero, some, or all photos.

## Layout

```
index.html              markup for all three views
images/                 model photos, by brand — empty, see images/README.md
styles/
  base.css              design tokens, reset, header, notes, footer
  components.css        chips, brand tiles, ladder, cards, spec table, compare picker
  responsive.css        narrow-screen and reduced-motion overrides (loaded last)
scripts/
  data/
    index.js            category definitions + the registry brands fill
    yamaha.js …         one file per brand (7 brands), 9–25 model lines each
    years.js            launch years for all models, prior generations for 49
    derive.js           ptw, id, uid, estimate sets, licence ranking, year resolver
  metrics.js            the five sort metrics; metric-button wiring
  categories.js         the category and year chip components, shared by all views
  ladder.js             the animated bar chart, shared by both ladders
  brand-view.js         picker (chips + brand grid) and the brand page
  compare-view.js       cross-brand selection, filters and ladder
  app.js                view routing, delegated clicks/keyboard, resize
```

Load order matters: each script hangs off a shared `SBL` global, the brand files
must come after `data/index.js` and before `data/derive.js`, and `app.js` runs last.
The stylesheets must stay in the order above, since `responsive.css` overrides the
component defaults.

### Deploying: bump the asset version

```
./bump-assets.sh    # then commit index.html with your change
```

Every local CSS and JS reference in `index.html` carries a `?v=` stamp. This is not
cosmetic. The host serves `index.html` with `max-age=0` but scripts and styles with
`max-age=14400`, so a browser can hold four-hour-old assets while the HTML updates
immediately — new markup wired to old JavaScript. That is precisely how the year
selector once shipped as an empty row on a phone: the `MODEL YEAR` heading rendered
from fresh HTML while the script that fills it came from cache.

Run the script whenever you touch `styles/` or `scripts/`. Nothing enforces it, so if
a deploy ever looks half-applied, check this first.

### How the ladder animates

Rows are built into the DOM once and never reordered. Sorting only rewrites each
row's `translateY`, which is what makes a re-sort slide instead of snap. Filtering
by category hides rows rather than rebuilding them, so switching categories animates
the same way. Row height lives in the `--row-h` custom property so that JS and the
narrow-screen breakpoint cannot disagree about it; a resize re-lays the ladder after
a 150 ms debounce.

### Adding a bike

Add an entry to the relevant `bikes` array in `scripts/data/<brand>.js`, including a
`cat` key from `SBL.CATEGORIES`, and a `"<brand>|<name>"` entry in
`scripts/data/years.js` giving at least its `from` year. `ptw`, `id`, `uid` and the
estimate set are derived at load, and the chips, ladders, cards, spec tables and compare checkboxes all build
themselves from that array — nothing else needs touching.

### Adding a brand

Two steps: write `scripts/data/<brand>.js` calling `SBL.registerBrand()`, and add a
`<script>` tag for it in `index.html` between `data/index.js` and `data/derive.js`.
Everything else — picker tile, category chips and their counts, brand page, compare
column, spec tables, image folder convention — derives from the registry.

Counts in the page copy are written from the data at runtime via `[data-count]`, so
prose like "seven manufacturers" and "129 models" updates itself.

Pick the accent colour for **distinguishability**, not just brand fidelity: bars in the
compare ladder are colour-coded, and the existing palette's closest pair sits at about
ΔE 16 in Lab space. BMW Motorrad's own blue measured ΔE 8.7 against Suzuki — too close
to read — so BMW uses its M dark blue at ΔE 31 instead.

## About the numbers

Power figures are manufacturer claims measured at the crank; expect roughly 10–15%
less at the rear wheel. Licence classes are European: A1 covers 125cc and 11 kW, A2
caps at 35 kW with a power-to-weight limit, A is unrestricted.

### Where the figures come from

Power, torque, wet weight and seat height are being verified brand by brand against
each manufacturer's own European spec pages. Every model card states which it is:
*verified against \<source\>* with a link, or *not yet verified*.

| brand | verified | notes |
| --- | --- | --- |
| Kawasaki | 25 / 25 | done — see `src` on each entry |
| Honda | 22 / 22 | done; two models added that were missing entirely |
| Yamaha | 18 / 18 | done; model-year history sourced too, see below |
| BMW | 22 / 23 | done; the G 310 GS has no live page anywhere in the EU |
| Suzuki | 17 / 18 | done; two models added, and the SV650X has no live page |
| Aprilia, Ducati | 0 / 23 | model knowledge, not re-sourced |

**Across the five brands checked so far, 107 of 389 fields were wrong — 72% accurate.**
That rate is the honest prior for the two brands still unverified. Worst cases were
seat heights out by 10–35 mm, the ZX-10R (three of four figures wrong) and the Gold
Wing, which was carrying the Tour version's 393 kg instead of the base bike's 373.
Not every miss is equal: about a third of Yamaha's were decimal precision the old
figures had rounded away (113 → 113.3 Nm, 166 → 165.9 PS), while the Tracer 9 was
wrong by six kilos and 35 mm. Treat any unsourced figure accordingly.

A recurring cause: manufacturers list several variants per model line, or several model
years, and the wrong one is easy to grab. Honda UK now sells the CBR500R, CB500 Hornet,
CBR650R and NX500 only with E-Clutch, so those four legitimately weigh a few kilos more
than the manual bikes they replaced; the Tracer 9's figures here were the 2024 bike's,
six kilos and 35 mm of seat height off the 2025 one. Where a page offers a choice, the
figures are the standard current model's and the variant is described in the model's
note instead.

A second cause is that manufacturers do not always agree with themselves. Suzuki's UK
site publishes 137 kg for the GSX-R125 where the Italian one publishes 134; BMW dropped
the G 310 R from the UK range but France still lists it. Where national sites disagree
the card links to whichever one its figures actually came from, and says why in its note
— so a `src` link is a claim about that specific card, not a brand-wide gesture.

Verification normally covers *current* specs only, and where correcting a current figure
would have changed what a generation inherits, the previous value is pinned explicitly
so history did not move.

**Yamaha and BMW are the exceptions, and the reason the archive is so much deeper than
it was.** Yamaha keeps a separate spec page per model year going back to 2019; BMW keeps
technical-data pages for superseded model years alongside the current ones. Between them
that turned twenty-one archive entries across thirteen models from inference into sourced
fact, and moved the S 1000 RR, M 1000 RR, F 900 R, S 1000 R and R 18 onto generations
that did not previously exist here. No other manufacturer publishes either.

**Estimated figures are marked with a dotted underline** in the ladder, the model
cards and the spec tables. Manufacturers publish power, torque, weight and seat
height for nearly everything, but rarely 0–100 km/h or top speed outside the sport
class — those two fields are derived from power-to-weight for almost every model
here and should be read as a ranking, not a stopwatch.

BMW is the one brand that quotes real maximum speeds, so twelve of its models carry a
measured figure rather than a derived one and are not marked as estimated. Where BMW
says only "over 200 km/h", the estimate stands. Going the other way, BMW omits maximum
torque for the S 1000 RR, F 800 GS and F 900 GS; the S 1000 RR's figure comes from BMW's
own page for the previous model year and the same unchanged engine, and the two GS
figures remain unverified even though the rest of those cards are sourced.

Model years are the launch or redesign year of the generation currently on sale, good
to about ±1 year; a colour change is not treated as a new generation. A generation
whose range runs into the current entry's `from` year can never be selected, so
`derive.js` warns about that in the console rather than dropping it silently.

Weights are kerb/wet **with** fuel. Ducati publishes weight with the tank empty, so
those figures are converted at 0.75 kg per litre of tank capacity; expect a 1–2 kg
margin on that brand.

Compiled August 2026.
