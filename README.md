# The Ladder

Every manufacturer sells a staircase: a learner bike at the bottom, a flagship at
the top, and a set of compromises in between. This is an interactive look at how
seven manufacturers space their rungs — and which ones a given European licence
actually reaches.

Seven manufacturers, 130 model lines, six categories, model years 2020–2026.

## Using it

Open `index.html` in a browser. No build step, no dependencies, no server needed —
it is plain HTML, CSS and JavaScript, and works straight off the filesystem or from
any static host.

Three views:

| View | What it does |
| --- | --- |
| **Picker** | Category chips first, then the seven lineups. Each brand tile summarises whichever category is selected. |
| **Brand** | One manufacturer, filterable by category and year, with a re-sortable ladder, a card per model and a full spec table. |
| **Compare** | All 130 models on one ladder, coloured by brand, with per-model checkboxes plus year, category, licence and seat-height filters. |

Both ladders sort by power, 0–100 km/h, top speed, weight or power-to-weight. Rows
slide to their new positions rather than jumping, so you can see what moved.

### Search

Every header carries a search field — press `/` from anywhere — matching model name,
engine short label and brand. Picking a model opens its brand page at that card;
picking a brand opens the brand.

Matching is a normalise-and-substring pass over 130 entries, ranked, rebuilt on each
keystroke. At this scale that beats an index on every count that matters: no build step,
no dependency, and the whole thing fits on a screen. Stripping punctuation is what makes
it forgiving — `GSX-R125` and `gsxr` both come down to `gsxr125` and `gsxr`, so the hyphen
a reader never types stops mattering.

| rank | match | example |
| --- | --- | --- |
| 0 | the whole name | `r7` → R7 |
| 1 | name starts with it | `gsxr` → GSX-R125 |
| 2 | a word in the name starts with it | `africa` → CRF1100L Africa Twin |
| 3 | name contains it | `r7` → XSR700 |
| 4 | brand and name together | `yamahar7` → R7 |
| 5 | engine label | `689`, `cp2` → the five CP2 bikes |
| 6 | brand | `kawa` → the Kawasaki range |

Within a rank that matched the *name*, the shorter name wins — `gsxr` prefixes both the
GSX-R125 and the GSX-R1000R, and the 125 is the tighter match. Ranks 5 and 6 matched
something other than the name, where its length says nothing, so those stay alphabetical.
Either way the order never depends on the order the data happens to be in.

A brand match returns **one** row rather than every bike it sells: `ducati` means take me
to Ducati, not here are fifteen Ducatis. Two characters is the floor, or a single letter
would return half the catalogue.

Picking a model clears whichever filters would have hidden it. Someone who typed a bike's
name has asked for that bike; a category chip left over from earlier is not a reason to
hand them a page it is filtered out of. The card flashes on arrival, because a jump to
the top of a page of near-identical cards is not by itself an answer to *which one*.

### Links

Everything on screen is in the address bar, so any view can be sent to someone else:

```
#/                                 the picker
#/ducati?cat=sport&m=ptw           a brand page, filtered and sorted
#/compare?y=2021&m=weight&sel=…    the compare view, in a past model year
#/compare?seat=810                 everything with a seat at or below 810 mm
```

Changing view pushes a history entry, so Back returns where you came from; changing a
filter replaces it, so Back does not step through every chip you touched on the way. A
push fires `hashchange`, and the router ignores the one that comes back from its own
write — the views are already in that state, and re-reading it would rebuild them and
throw away anything done afterwards, such as the search field's jump to a card. Back and
Forward never match it, so they still read normally.

The compare selection is a bitmask over the model list, six bits per character — 130
checkboxes in 22 characters. The model count rides along as a prefix (`130.…`) because
adding a bike shifts every index after it: on a mismatch the selection falls back to
"everything" rather than silently selecting the wrong machines. Anything else unparseable
in the hash is ignored rather than trusted, since the address bar is user-editable.

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
130 models, but prior-generation *specs* exist for 49 of them — the ones where the
figures are actually known, like the 955cc Panigale V2, the Ninja 400 before it became
the 500, and the R 1250 GS. Every other model shows its current figures for each year
it was on sale. The line under the year chips always reports both numbers, so a bike
shown at today's specs is never mistaken for one that genuinely did not change. The
alternative — inventing seven years of numbers for 130 bikes — would make the whole
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

Sorting all 130 at once is mostly a novelty — a Gold Wing and a Panigale V4 R share
a ladder because they are both motorcycles, not because the comparison means
anything. The category filter is where the useful comparisons live.

## Model photos

Photos are convention over configuration — drop a file at `images/<brand>/<id>.jpg`
and it appears on that model's card. Nothing else to change. `images/MANIFEST.txt`
lists the expected path for all 130 models, and `images/README.md` covers formats,
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
    derive.js           ptw, id, uid, tyre parsing, estimates, licence rule, years
  metrics.js            the five sort metrics; metric-button wiring
  categories.js         the category and year chip components, shared by all views
  ladder.js             the animated bar chart, shared by both ladders
  brand-view.js         picker (chips + brand grid) and the brand page
  compare-view.js       cross-brand selection, filters and ladder
  search.js             the ranked model search in each header
  router.js             view state <-> the address bar
  app.js                view switching, delegated clicks/keyboard, resize
```

Load order matters: each script hangs off a shared `SBL` global, the brand files
must come after `data/index.js` and before `data/derive.js`, `router.js` needs both
views to exist, and `app.js` runs last.
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
estimate set are derived at load, and the chips, ladders, cards, spec tables and compare
checkboxes all build themselves from that array — nothing else needs touching.
`tyreF`/`tyreR` are optional: give them the manufacturer's tyre designation exactly as
published and the wheel rows follow, or leave them off and the card says *not published*
rather than showing a gap. There is no licence field — the class is computed; give it
`kw` and `a2` if the manufacturer publishes them, and `track:1` if it is not road-registered
here. See [Licence classes](#licence-classes). `sLow` is optional and records the lowest
published seat height where a lower seat or lowered version exists; see
[Seat height](#seat-height).

### Adding a brand

Two steps: write `scripts/data/<brand>.js` calling `SBL.registerBrand()`, and add a
`<script>` tag for it in `index.html` between `data/index.js` and `data/derive.js`.
Everything else — picker tile, category chips and their counts, brand page, compare
column, spec tables, search index, image folder convention — derives from the registry.

Counts in the page copy are written from the data at runtime via `[data-count]`, so
prose like "seven manufacturers" and "130 models" updates itself.

Pick the accent colour for **distinguishability**, not just brand fidelity: bars in the
compare ladder are colour-coded, and the existing palette's closest pair sits at about
ΔE 16 in Lab space. BMW Motorrad's own blue measured ΔE 8.7 against Suzuki — too close
to read — so BMW uses its M dark blue at ΔE 31 instead.

## About the numbers

Power figures are manufacturer claims measured at the crank; expect roughly 10–15%
less at the rear wheel. Licence classes are European and are **worked out from each
bike's own figures** rather than stored — see [Licence classes](#licence-classes).

### Where the figures come from

Power, torque, wet weight and seat height have been verified brand by brand against each
manufacturer's own European spec pages. Every model card states which it is: *verified
against \<source\>* with a link, or *not yet verified*.

| brand | verified | notes |
| --- | --- | --- |
| Kawasaki | 25 / 25 | done — see `src` on each entry |
| Honda | 22 / 22 | done; two models added that were missing entirely |
| Yamaha | 18 / 18 | done; model-year history sourced too, see below |
| BMW | 22 / 23 | done; the G 310 GS has no live page anywhere in the EU |
| Suzuki | 17 / 18 | done; two models added, and the SV650X has no live page |
| Ducati | 15 / 15 | done; worst rate of the six, see the weight note below |
| **Aprilia** | **0 / 9** | **cannot be verified — see below** |

**Aprilia is the one brand that could not be checked, and that is a property of their
website rather than a gap in effort.** aprilia.com renders its technical data entirely
client-side; the page HTML contains no figures, the Magnolia endpoint behind it returns
503 through the CDN for every path shape, and the site refuses requests carrying a JSON
`Accept` header. Its nine models therefore keep their original figures and are marked
*not yet verified* on every card, with a brand note saying why. What *was* checkable is
the range itself: aprilia.com publishes a server-rendered sitemap, and it confirms all
nine models are current and that no road model is missing.

**Across the six brands that could be checked, 134 of 445 fields were wrong — 70%
accurate.** That rate is the honest prior for Aprilia's nine. Worst cases
were seat heights out by 10–35 mm, the ZX-10R (three of four figures wrong) and the Gold
Wing, which was carrying the Tour version's 393 kg instead of the base bike's 373.
Not every miss is equal: about a third of Yamaha's were decimal precision the old
figures had rounded away (113 → 113.3 Nm, 166 → 165.9 PS), while the Tracer 9 was
wrong by six kilos and 35 mm. Treat any unsourced figure accordingly.

Ducati is the outlier at 52% — 27 of 56 fields wrong — and for a structural reason rather
than carelessness. It is the only manufacturer here that publishes weight with the tank
empty, so every Ducati weight on this page is an arithmetic conversion rather than a
quotation, and the conversion had been applied inconsistently. Half the brand's misses
are that one mistake repeated. See the weight note under the Ducati brand page.

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

Weights are kerb/wet **with** fuel. Ducati is the exception: it publishes what it calls
"wet weight no fuel", so every Ducati figure here is its published weight plus the tank
capacity at 0.75 kg per litre. That puts the numbers 9–17 kg above Ducati's own, which is
the point — otherwise the brand would look artificially light against the other six. They
are the only figures on the site that are arithmetic rather than quotation, so expect a
1–2 kg margin on Ducati and nowhere else.

### Where a bike sits in its class

`230 kg` says nothing on its own: it is light for an adventure bike and enormous for a
supersport. The ladder supplies that frame, but only for the metric currently selected and
only while you are looking at it. Each model card now carries it in words, under power,
weight and power-to-weight:

```
POWER              116 PS · 85 kW
                   4th most powerful of 18 retros
WET WEIGHT                  216 kg
                   14th lightest of 18 retros
POWER TO WEIGHT           0.54 PS/kg
                   4th best power-to-weight of 18 retros
```

**A rank of a stated total, never a percentile.** Two of the six categories hold fewer than
twenty machines and one holds eight, where a percentile claims a precision the set cannot
carry — *in the 87th percentile of cruisers* is seven bikes wearing a lab coat. A rank that
names its field is honest at any size, and the reader can see the size.

**Ties are ranked jointly**, the way a results table does it: three bikes on 218 PS are all
first and nothing is second. Ties are not rare — 37 models share a power figure with
someone in their category and 42 share a weight — so `joint 5th most powerful of 32 sport
bikes` earns its word. The superlatives take an article when they stand alone and lose it
when they do not: *the lightest*, but *joint lightest*.

**The comparison set is the whole category across all seven brands**, resolved to the model
year on screen — so a card viewed at 2021 is ranked against the 2021 field, not today's.
That is most of what makes it worth doing: the MT-09 is 14th most powerful of 36 nakeds
now and was 4th of 15 in 2020, and the bike did not change. A category filter narrows what
is *shown* and never what a rank is measured against; `renderCards` is handed the resolved
field once per render rather than the filtered one.

Power-to-weight comes to the card with this. The spec table has carried it all along and
the card never has, which left the figure that best predicts how a bike feels visible only
in a table nobody scrolls to.

### Seat height

Seat height decides more about whether a bike is usable than any other figure on the
site, and the spread is wide — 690 mm on a BMW R 18 to 904 mm on a Hypermotard 698 Mono.
The compare view carries a **maximum seat height** slider for it.

A slider rather than chips, because a chip row would have to pick the thresholds and the
threshold that matters belongs to the rider. Its ends come from the data, snapped outward
to its own 5 mm step, so adding a taller bike moves the track instead of falling off it;
at the top of its travel it means *no limit*, not 905 mm.

It filters **what is drawn, not what is ticked**, so it stacks with the year, category and
licence filters rather than overwriting the selection the way the quick-select buttons do.
It runs after the year resolves, so a generation is measured on its own seat. The count
line reports what it removed: `54 of 130 models shown · 76 over 810 mm hidden`.

**The caveat is not boilerplate**, and it appears whenever a limit is set — which is
exactly when someone is about to rule a bike out on 10 mm. Seat height is a proxy for
reach, not a measurement of it: a narrow 830 mm seat can be easier to get a foot down on
than a wide 810 mm one, and the suspension gives some of it back under the rider's weight.

#### Lowered variants

Twelve models name a lower seat, lowering kit or lowered version with a figure in their
prose, now recorded as `sLow`. **The filter does not match on it.** A lowered variant is a
different bike or a different invoice, so letting one through quietly would break the
promise the slider makes. Dropping it silently would be worse, so those models are named
underneath the slider when they come within the limit that way — shown as information,
not as results.

```js
s:820, sLow:780     // R 1300 RT: standard seat, and the comfort seat low option
```

### Licence classes

A1 and A2 are rules, not labels, and the site holds both numbers each rule needs. So
`SBL.licence()` applies the rule — Directive 2006/126/EC, Article 4 — instead of reading
a class out of the data:

| class | conditions, all of which must hold |
| --- | --- |
| **A1** | ≤ 125 cc, ≤ 11 kW, ≤ 0.1 kW/kg |
| **A2** | ≤ 35 kW, ≤ 0.2 kW/kg, and not derived from a machine of more than double its power |
| **A** | everything else |

Every card carries a **Licence** row showing the working: the two figures, the limit they
were measured against, and — when a bike misses — which limit and by how much. `A` on its
own is a conclusion; `111 kW and 0.55 kW/kg — over the 35 kW ceiling and the 0.2 kW/kg
limit` is something a reader can check.

**The ceiling is not always 35 kW.** Both A2 limits apply at once, so below 175 kg the
ratio bites first: a 160 kg machine may make 32 kW, not 35. The row says so wherever that
happens, or a bike restricted to 32 kW reads as a mistake.

**The double-power clause is implemented, and it is the interesting one.** It is why a
54 kW twin can be restricted and a 77 kW one cannot, and it is invisible in a licence
label. A restriction may only take a machine down to the cap if the full-power bike is
within twice that cap — 70 kW for most, 64 kW for the Hypermotard 698 Mono. Manufacturers
build to it: Honda's 650s are exactly 70 kW, and BMW answers 77 kW models with a separate
70 kW A2 variant rather than a kit.

#### The two fields a calculation cannot reach

```js
kw:35            // rated output as the manufacturer publishes it
a2:"kit"         // the manufacturer restricts this machine itself
a2:"version"     // a separate reduced-power model is sold instead
```

**`kw` exists because the limits are written in kW and the power column is in PS.** Half a
PS is 0.37 kW, which is enough to move a bike across a limit: converting the Honda NX500's
published `48 PS` back gives 35.3 kW and fails a machine Honda sells as 35.0 kW. Eight
bikes flipped on that rounding alone. 93 of the 130 now carry a published kW, taken from
the same manufacturer pages their `src` already cites; Suzuki and Aprilia publish PS only,
which is most of the rest.

Where `kw` is absent the class is still computed, from a converted figure that carries the
rounding it inherited. The comparison allows for that slack, and when the slack is what
decided the call the row says so and points at the PS figure it came from, so a reader can
see the overshoot is arithmetic rather than the machine. Six bikes land there: the Suzuki
and Aprilia 125s against the 11 kW A1 ceiling, and the RS 457 and Tuono 457 against 35 kW.

**Weight gets no such allowance**, deliberately. The site's wet weights carry a stated
±1–2 kg, but the rule is applied to the kerb figure the manufacturer publishes, which is
the same figure type approval uses — real-world scatter is a different question from
which side of the line the paperwork falls on.

**`a2` is a fact about what is on sale**, which no arithmetic will yield: a bike can be
perfectly restrictable and have no kit behind the parts counter. The Kawasaki ZX-4RR is
one — 57 kW at 189 kg, low enough that a restriction would be legal, and none is offered.
The rule decides whether an offered restriction is *legal*; `a2` says whether one *exists*.
A `kit` the figures could not support is a contradiction, so `licence()` warns in the
console rather than printing it, in the same spirit as the unreachable-generation check.

Computing the class rather than copying it found seven errors in the data it replaced:
the Vulcan S is 44.7 kW and needs the kit rather than being A2 as it stands, and BMW
publishes A2 pathways for the F 900 R, F 900 XR, R 12, R 12 nineT and R 12 S that the
labels had as plain `A`. The R9's Yamaha spec sheet lists a 35 kW limited-power version.

**This is guidance for narrowing a shortlist, not a legal determination**, and the page
says so — in the caveats, and again on any card where a converted figure decided a close
call. Confirm with the dealer before buying.

### Wheels and tyres

**Nothing here is calculated.** A tyre designation is a compressed list of separate facts,
so the card splits it back out and labels each one, in the unit that fact is conventionally
given in.

The block is the only one on the card with a **value per end**, so it carries a front/rear
heading and two aligned columns, and both are always filled even when they hold the same
figure. Everything else on a card is a single value, so an unheaded `120 / 180` reads as one
number in a notation the reader is expected to already know — which is exactly how it was
first shipped, and exactly the confusion this whole block exists to remove.

| row | from | unit |
| --- | --- | --- |
| Rim | last number | inches — the language everyone uses for wheel size |
| Tyre width | first number | mm |
| Profile | second number | % of the width |
| Speed rating | the letter | plus what it certifies, in km/h |
| Tyres | the whole thing | as published |

`180/55 ZR17 73W` is a 180 mm section width, a sidewall 55% of that width, a Z-rated
radial, a 17-inch rim and a load index of 73. Every one of those is moulded into the
sidewall. Both spec tables carry the rim alone, under a `Rim f/r` heading.

Only the manufacturer's own string is stored, in `tyreF` and `tyreR`. `tyreSpec()` splits it
at the point of use, so a generation that overrides the tyres needs no other bookkeeping
and nothing can fall out of sync.

Three details in the parsing:

- **Speed rating comes from two places.** Modern tyres put it in the service description
  (`73W`); fast and older ones put it as the `Z` ahead of the `R`. The explicit one wins
  and the prefix is the fallback, so 99 of the 116 show one.

  **The other 17 are a publishing gap, not a tyre without a rating.** Every road tyre sold
  in Europe carries a speed symbol moulded on the sidewall — what varies is whether the
  manufacturer bothers to reprint it. BMW publishes no service descriptions at all, so its
  sport bikes get `Z` from the code and its eight `R`-coded models get nothing; Ducati is
  the same, and the rest are small bikes whose pages are terse. The row is therefore shown
  with an em-dash and a note naming the manufacturer, rather than dropped — an absent row
  would claim the tyre has no rating, which is untrue for sixteen of the seventeen.

  **The seventeenth is real.** The H2R wears racing slicks, which are not road-legal and
  carry no speed symbol at all. Its note says so instead.
- **A profile of exactly 100 is real.** `80/100-18`, the CB125F's front, sits on the
  ceiling of the scale.
- **Racing slicks reuse the profile slot for overall diameter in mm.** The H2R's
  `120/600 R17` is a 600 mm tyre, not a 600% sidewall. That row is left off for slicks
  rather than printed as a percentage it is not; the full code is on the card regardless.

The spread that matters is **width**: 80 mm on a CB125F to 240 mm on a Diavel V4. Rims
barely move — 87 of the 116 run 17 inches at both ends, and the column only changes in
adventure (19/17, 21/18), cruiser (18/16, 19/16) and retro.

**14 models have no tyre data** and show *not published* on the card and an em-dash in
the tables — the same nine Aprilias whose site cannot be read at all, plus the five whose
manufacturers no longer publish a spec page for them: the Ninja H2 and Versys-X 300, the
G 310 GS, and Ducati's Panigale V4 and Superleggera V4.

Compiled August 2026.
