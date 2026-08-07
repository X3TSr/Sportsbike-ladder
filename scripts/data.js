/* ==========================================================================
   DATA — the six lineups.
   Pure content, no behaviour. Everything downstream reads from here.

   Bike fields (kept terse because they repeat 32 times):
     n   name              e   engine, long form
     es  engine, short     p   power, PS (crank)
     t   torque, Nm        w   wet weight, kg
     a   0-100 km/h, s     ts  top speed, km/h
     s   seat height, mm   l   licence class
     x   variant note (optional)
     r   what it is for (HTML)
     v   the verdict (HTML)

   Derived at the bottom of this file: ptw, id, uid.
   ========================================================================== */

var SBL = window.SBL || {};

SBL.DATA = {
yamaha:{name:"Yamaha",series:"YZF-R Series",accent:"#1039A8",
 lede:"The most complete staircase in motorcycling, and the only one where every rung shares the same design language. Two of the six rungs no longer reach European roads.",
 bikes:[
  {n:"R125",e:"125cc single, VVA",es:"125 single",p:15,t:11.5,w:141,a:11,ts:135,s:820,l:"A1",
   r:"<b>The entry point, built like the rest.</b> Deltabox frame, 41 mm KYB upside-down forks, traction control, slipper clutch and a quickshifter-ready harness — none of which is normal at 125cc.",
   v:"Capped at 11 kW by licence law rather than engineering. <span>It runs on momentum and gearbox work</span>, which is why it teaches corner speed better than anything above it."},
  {n:"R3",e:"321cc parallel-twin",es:"321 twin",p:42,t:30,w:169,a:5.4,ts:180,s:780,l:"A2",
   r:"<b>The natural next step.</b> Same R-series ergonomics and styling as its bigger siblings, with a 780 mm seat and near 50/50 weight balance that make it forgiving to learn on.",
   v:"Three times the power of the R125 for a modest step in price. <span>The obvious first A2 bike</span> — more speed without changing how the machine behaves."},
  {n:"R7",e:"689cc CP2 parallel-twin",es:"689 CP2",p:73,t:67,w:188,a:3.5,ts:224,s:835,l:"A / A2 kit",
   r:"<b>The one you can actually use.</b> MT-07 engine, sportbike chassis, fully adjustable KYB forks and Brembo master cylinders. Extensively updated for 2026 with sharper geometry and new electronics.",
   v:"Strong pull from 3,000 rpm means you are rarely in the wrong gear. <span>The most sensible fast bike Yamaha makes</span>, and one an A2 licence can grow into."},
  {n:"R9",e:"890cc CP3 inline-triple",es:"890 I3",p:119,t:93,w:195,a:3.1,ts:260,s:831,l:"A",
   r:"<b>The new middle.</b> The MT-09 triple in a dedicated supersport chassis with launch control, slide control, adjustable wheelie control and cornering ABS.",
   v:"Gearing about 5% shorter than the MT-09 puts the engine in its strongest band exactly where road riding happens. <span>Fast without literbike consequences.</span>"},
  {n:"R6 Race",e:"599cc inline-four",es:"599 I4",p:118,t:62,w:190,a:3.5,ts:257,s:850,l:"Track only",
   x:"R6 GYTR available as a full factory race kit",
   r:"<b>The purist's choice.</b> A 14,500 rpm inline-four sold with no lights and no registration, kept alive for club racers after emissions ended its road career.",
   v:"Almost nothing happens below 8,000 rpm. <span>Brilliant on a circuit, miserable in traffic</span> — which is why it stopped pretending otherwise."},
  {n:"R1",e:"998cc CP4 inline-four",es:"998 I4",p:200,t:113,w:203,a:3.1,ts:299,s:855,l:"Track only (EU)",
   x:"Also sold as R1M with Öhlins electronic suspension and carbon bodywork",
   r:"<b>The flagship.</b> MotoGP-derived crossplane crank, six-axis IMU, carbon winglets. Euro 5+ pushed it off European roads, so here it is a circuit machine that happens to have a headlight.",
   v:"The crossplane torque pulses reward precise throttle inputs and punish sloppy ones. <span>Not a step up from an R7 — a different animal.</span>"}],
 notes:[["Both inline-fours are gone from EU roads","Yamaha confirmed there would be no Euro 5+ R1 or R1M. The R6 went first, after 2020, and survives only as the track-only R6 Race."],
        ["Even the R6 Race is ending","Yamaha opened two final order windows in Japan during July and August 2026, with the last bikes delivered in February 2027. Road-legal R6s are 2020 or earlier."],
        ["The R9 fills the gap","With both fours withdrawn from European roads, the CP3 triple is now Yamaha's fastest street-legal R model here."],
        ["A2 riders have two routes","The R3 qualifies as it comes. The R7 is sold in a 35 kW version that can be derestricted once you hold a full A."]]},

kawasaki:{name:"Kawasaki",series:"Ninja",accent:"#5FB030",
 lede:"The widest ladder here, and the only one still selling a small-capacity inline-four. Six rungs, no gaps, from an A1 commuter to a 203 PS superbike.",
 bikes:[
  {n:"Ninja 125",e:"125cc single",es:"125 single",p:15,t:11.7,w:148,a:11,ts:130,s:785,l:"A1",
   r:"<b>Full-size looks, learner engine.</b> Styled directly after the ZX-10R with a trellis frame and a low 785 mm seat that makes it one of the easiest 125s to manage in town.",
   v:"Heavier than most rivals and it feels it at low revs. <span>Bought for the looks more than the numbers</span>, which is a perfectly reasonable thing to do at this level."},
  {n:"Ninja 500",e:"451cc parallel-twin",es:"451 twin",p:45,t:43,w:171,a:5.2,ts:180,s:785,l:"A2",
   r:"<b>The sensible middle of the small class.</b> Replaced the Ninja 400 with more displacement and more midrange, keeping the low seat and light steering that made its predecessor a favourite.",
   v:"More torque than the old 400 where you actually ride. <span>The easiest bike here to get along with</span> if you are stepping off a 125."},
  {n:"Ninja 650",e:"649cc parallel-twin",es:"649 twin",p:68,t:64,w:193,a:4,ts:210,s:790,l:"A / A2 kit",
   r:"<b>The sport-tourer in disguise.</b> Upright bars, a 790 mm seat and a torquey twin — a Ninja that is genuinely comfortable over distance rather than a supersport with a fairing.",
   v:"Not the sharpest thing here and not trying to be. <span>The one you would still enjoy after two hours</span> on the motorway."},
  {n:"ZX-4RR",e:"399cc inline-four",es:"399 I4",p:77,t:38,w:189,a:3.9,ts:235,s:800,l:"A",
   x:"Also sold as ZX-4R and ZX-4R SE at lower suspension spec",
   r:"<b>The revival nobody expected.</b> A 399cc four spinning to 14,500 rpm, with Showa SFF-BP forks and the same BFRC-lite rear shock as the ZX-10R.",
   v:"An anachronism in the best way — the noise and the top end of a 1990s 400 with modern suspension. <span>Slow on paper, thrilling in practice.</span>"},
  {n:"ZX-6R",e:"636cc inline-four",es:"636 I4",p:130,t:69,w:198,a:3.2,ts:260,s:830,l:"A",
   r:"<b>The last true 600 on sale.</b> The extra 36cc over a standard supersport gives it midrange most rivals never had, which is exactly why Kawasaki kept it at 636.",
   v:"The class almost everyone else abandoned, still here. <span>The most usable inline-four supersport you can buy new.</span>"},
  {n:"ZX-10R",e:"998cc inline-four",es:"998 I4",p:203,t:115,w:207,a:3,ts:299,s:835,l:"A",
   x:"ZX-10RR adds lighter pistons and Pankl titanium rods",
   r:"<b>Six World Superbike titles' worth of development.</b> Kawasaki's flagship, now competing for attention with the company's racing focus having shifted elsewhere.",
   v:"Stable, planted and less nervous than most literbikes. <span>The superbike that flatters the rider most</span> — which is a compliment, not a criticism."},
  {n:"Ninja H2",e:"998cc supercharged inline-four",es:"998 SC I4",p:231,t:142,w:238,a:2.6,ts:299,s:825,l:"A",
   x:"Ninja H2 Carbon adds a carbon-fibre upper cowl",
   r:"<b>The only supercharged production motorcycle.</b> Kawasaki built its own centrifugal supercharger in-house, using aerospace expertise from other divisions of Kawasaki Heavy Industries. 231 PS, rising past 240 with ram air.",
   v:"Also the heaviest bike here by 30 kg, and it does not hide it in slow corners. <span>Nothing else sounds remotely like it</span> — the supercharger whine is the entire reason it exists."},
  {n:"Ninja H2R",e:"998cc supercharged inline-four",es:"998 SC I4",p:310,t:165,w:216,a:2.5,ts:380,s:830,l:"Track only",
   r:"<b>310 PS, no lights, no plate.</b> A closed-course machine with carbon winglets, a higher-boost supercharger and a chassis rated for speeds no public road permits.",
   v:"More than three times the power of anything an A2 licence reaches, and 20 times the R125. <span>Included here for scale rather than as a recommendation.</span>"}],
 notes:[["The ZX-4RR is genuinely unusual","No other manufacturer currently sells a small-capacity inline-four sportbike in Europe. If you want that engine character, this is the only new option."],
        ["ZX-10R's future is unclear","It was absent from Kawasaki's 2026 sport lineup announcement, though it was subsequently confirmed for other markets. Euro 5+ compliance has not been publicly addressed."],
        ["Ninja 500 replaced the 400","Same chassis philosophy, more displacement. Used Ninja 400s remain excellent and considerably cheaper."],
        ["Two bikes suit A2","The Ninja 500 as standard, the Ninja 650 with a restriction kit that can be removed later."]]},

honda:{name:"Honda",series:"CBR",accent:"#E4002B",
 lede:"A short ladder with a very tall top step. Honda abandoned the small-capacity sport class in Europe, so the CBR range starts where others are already halfway up.",
 bikes:[
  {n:"CBR500R",e:"471cc parallel-twin",es:"471 twin",p:48,t:43,w:192,a:5,ts:185,s:785,l:"A2",
   r:"<b>The A2 workhorse.</b> Built around the same platform as the CB500 range, with Showa SFF-BP forks and a riding position that leans sporty without committing to it.",
   v:"Unexciting on paper and completely dependable in practice. <span>The bike you recommend to someone who wants no surprises.</span>"},
  {n:"CBR650R",e:"649cc inline-four",es:"649 I4",p:94,t:63,w:209,a:3.8,ts:235,s:810,l:"A / A2 kit",
   r:"<b>An inline-four at middleweight money.</b> Available with Honda's E-Clutch, which removes the need for the clutch lever entirely without making it an automatic.",
   v:"Heavy for the class at 209 kg, but few bikes at this price sound like it. <span>You are buying the cylinder count</span>, and that is a legitimate reason."},
  {n:"CBR600RR",e:"599cc inline-four",es:"599 I4",p:121,t:63,w:193,a:3.3,ts:255,s:820,l:"A",
   r:"<b>Back from the dead.</b> Withdrawn from Europe, then reintroduced with updated electronics and aero winglets after Honda found the supersport class had not quite died.",
   v:"A proper old-school 600 that demands revs and rewards commitment. <span>Sharper and less forgiving than the ZX-6R</span>, which is the point."},
  {n:"CBR1000RR-R SP",e:"999cc inline-four",es:"999 I4",p:218,t:113,w:201,a:2.8,ts:299,s:830,l:"A",
   x:"Base CBR1000RR-R uses Showa suspension instead of Öhlins",
   r:"<b>The most powerful bike on this page.</b> Öhlins NPX S-EC 3.0 forks, Brembo Stylema R calipers, and aerodynamics developed directly from Honda's MotoGP programme.",
   v:"0&ndash;100 km/h in under three seconds, and it will beat almost anything else off the line. <span>Track-focused to the point of being awkward on the road.</span>"},
  {n:"CBR1000RR-R",e:"999cc inline-four",es:"999 I4",p:215,t:113,w:201,a:2.9,ts:299,s:830,l:"A",
   r:"<b>The Fireblade without the Öhlins.</b> Same engine, same aerodynamics, Showa suspension and Nissin brakes instead of the SP's Öhlins and Brembo package — and several thousand euro less.",
   v:"0–100 km/h in about 2.9 seconds, a tenth behind the SP. <span>The suspension gap only shows on a circuit</span>, which is worth knowing before paying for it."}],
 notes:[["No A1 option","Honda no longer sells a 125cc CBR in Europe. If you hold an A1 licence, the CBR ladder does not start until you upgrade."],
        ["The 600RR came back","Honda withdrew it from Europe under Euro 4, then reintroduced it. It remains one of only two inline-four 600s available new."],
        ["E-Clutch is worth trying","Honda's automated clutch on the CBR650R removes the lever without removing the gearbox. Unusual, and better in traffic than it sounds."],
        ["The Fireblade is expensive","The SP sits close to €27,000 in Europe, which is superbike money even by superbike standards."]]},

aprilia:{name:"Aprilia",series:"RS",accent:"#A50034",
 lede:"Four rungs, each one a genuine step rather than a filler model. Aprilia builds the most electronics-heavy bikes at every price point on this page.",
 bikes:[
  {n:"RS 125",e:"125cc single",es:"125 single",p:15,t:11,w:144,a:11,ts:130,s:820,l:"A1",
   r:"<b>The race-replica 125.</b> Aluminium twin-spar frame — rare at this capacity — with styling lifted straight from the RS 660 and an optional connectivity module.",
   v:"Built like a scaled-down superbike rather than a commuter with a fairing. <span>The most convincing 125 in the class</span>, and priced accordingly."},
  {n:"RS 457",e:"457cc parallel-twin",es:"457 twin",p:48,t:43.5,w:175,a:4.9,ts:180,s:800,l:"A2",
   r:"<b>The A2 bike with superbike electronics.</b> Three ride modes, three-level traction control, and an aluminium frame that uses the engine as a stressed member.",
   v:"Punches well above its class on specification. <span>The A2 machine that feels least like a compromise</span> — and the one with the best resale story so far."},
  {n:"RS 660",e:"659cc parallel-twin",es:"659 twin",p:105,t:67,w:183,a:3.4,ts:240,s:820,l:"A / A2 version",
   x:"RS 660 Factory and track-only RS 660 Trofeo also offered",
   r:"<b>The bike that created the class.</b> A 270° twin with the full APRC electronics suite borrowed from the RSV4 — cornering ABS, wheelie control, engine brake control, five ride modes.",
   v:"Lighter and more powerful than the R7 with far more technology. <span>The middleweight benchmark</span>, and the most complete bike here for the money."},
  {n:"RSV4 Factory",e:"1099cc 65° V4",es:"1099 V4",p:220,t:127,w:202,a:2.9,ts:305,s:855,l:"A",
   r:"<b>The V4 that made everyone else build one.</b> Semi-active Öhlins, winglets integrated into the fairing, and an engine note nothing else on this page approaches.",
   v:"Enormously fast and surprisingly civil at low speed. <span>The superbike with the most character</span>, if not the sharpest lap times."},
  {n:"RSV4",e:"1099cc 65° V4",es:"1099 V4",p:220,t:127,w:204,a:2.95,ts:305,s:855,l:"A",
   r:"<b>The same 220 PS for considerably less money.</b> Identical engine and frame to the Factory, with conventional Sachs suspension in place of the electronically controlled Öhlins and a slightly reduced electronics package.",
   v:"Aprilia changed nothing about the engine or chassis between the two. <span>You are paying purely for suspension and rider aids</span>, which is a clearer choice than most brands offer."}],
 notes:[["The RS 660 defined a segment","Yamaha's R7, Suzuki's GSX-8R and Honda's CBR650R all exist in the shape they do partly because Aprilia got there first in 2020."],
        ["An A2 RS 660 exists","Aprilia sell a 35 kW version from the factory rather than as a dealer kit, and it can be converted to full power later."],
        ["Electronics are the selling point","At every capacity, Aprilia fits more rider aids than direct rivals. Whether you need them at 48 PS is a fair question."],
        ["Servicing costs more","Italian parts and dealer coverage in Belgium is thinner than for the Japanese brands. Worth checking before you commit."]]},

ducati:{name:"Ducati",series:"Panigale",accent:"#C21807",
 lede:"No ladder at all — a plateau. Ducati's sport range begins where most brands finish, and the entry model is faster than the flagship of two others here. Five rungs, all of them above 120 PS.",
 bikes:[
  {n:"Panigale V2",e:"890cc 90° V-twin",es:"890 V2",p:120,t:93,w:191,a:3.4,ts:250,s:837,l:"A",
   r:"<b>Lighter, calmer, and deliberately less powerful than before.</b> The 2025 redesign dropped from 955cc and 155 PS to 890cc and 120 PS, ditched the desmodromic valves for spring-actuated finger followers, and shed weight in the process.",
   v:"Ducati chose usability over headline figures, and it worked — 70% of peak torque arrives by 3,000 rpm. <span>The most approachable bike wearing this badge in years.</span>"},
  {n:"Panigale V2 S",e:"890cc 90° V-twin",es:"890 V2",p:120,t:93,w:188,a:3.35,ts:250,s:837,l:"A",
   x:"Race replicas: Panigale V2 MM93 and V2 FB63 add forged wheels, Öhlins steering damper and lower clip-ons",
   r:"<b>The same bike with better parts.</b> Öhlins NIX30 fork and monoshock replace the Marzocchi and Kayaba units, plus a lithium-ion battery that accounts for most of the 3 kg saving.",
   v:"Identical power, meaningfully better damping. <span>Worth the premium only if you ride hard enough to feel it</span> — on a commute, the base V2 gives up nothing."},
  {n:"Panigale V4",e:"1103cc 90° V4",es:"1103 V4",p:216,t:121,w:195,a:2.7,ts:300,s:850,l:"A",
   r:"<b>The seventh-generation V4.</b> Redesigned for 2025 around a hollow symmetrical swingarm and revised front frame, with the explicit goal of making it easier to ride fast rather than simply faster.",
   v:"Showa suspension instead of the S model's Öhlins, and around €5,000 less. <span>The version most owners should actually buy.</span>"},
  {n:"Panigale V4 S",e:"1103cc 90° V4",es:"1103 V4",p:216,t:121,w:191,a:2.6,ts:300,s:850,l:"A",
   x:"Collezione 100 limited edition also offered, 100 units",
   r:"<b>The class benchmark.</b> Öhlins NPX pressurised forks under electronic control, Brembo Hypure calipers, and MotoGP-derived winglets revised again for 2026 along with a faster-processing semi-active suspension setup.",
   v:"0–100 km/h in roughly 2.6 seconds, quicker than anything else on this page. <span>Devastating, and priced to match.</span>"},
  {n:"Panigale V4 R",e:"998cc 90° V4",es:"998 V4",p:218,t:111,w:188,a:2.6,ts:305,s:855,l:"A",
   r:"<b>The homologation special.</b> Smaller displacement, shorter stroke and higher revs, built to satisfy WorldSBK regulations rather than road riders. The Desmosedici Stradale R makes 208.4 hp at 13,250 rpm in road trim.",
   v:"With the racing exhaust and dedicated oil it reaches 239 hp at 15,570 rpm — closed-course only. <span>Barely a road bike in any meaningful sense</span>, at close to $50,000."}],
 notes:[["There is no small Ducati sportbike","The range starts at 120 PS. An A1 or A2 licence reaches nothing in this lineup, and there is no restricted version of the V2."],
        ["The V2 got slower on purpose","The 2025 model traded 35 PS for a lighter, more usable machine and dropped desmodromic valves entirely. Owners of the old 955 still disagree about whether that was the right call."],
        ["Beyond the five core models","Ducati also sells the V2 MM93 and V2 FB63 race replicas, and the ten-model Collezione 100 series marking the company's centenary, each limited to 100 units. Those are trim and livery variations rather than separate rungs."],
        ["Servicing got cheaper at the bottom","Losing the desmodromic valve system on the V2 removes the single most expensive scheduled job in Ducati ownership. The V4 still needs specialist attention."]]},

suzuki:{name:"Suzuki",series:"GSX",accent:"#0079C1",
 lede:"A ladder with a missing middle. Suzuki still sells one of the best 125s in Europe and one of the great superbikes, with a large gap where the GSX-R600 and 750 used to be.",
 bikes:[
  {n:"GSX-R125",e:"125cc single",es:"125 single",p:15,t:11.5,w:134,a:10.5,ts:135,s:785,l:"A1",
   r:"<b>The lightest 125 here by some margin.</b> At 134 kg it undercuts every rival, with keyless ignition and a low 785 mm seat.",
   v:"Weight is everything at 15 PS, and this has the least of it. <span>The quickest A1 sportbike in a straight line</span>, purely because there is less of it to move."},
  {n:"GSX-8R",e:"776cc parallel-twin",es:"776 twin",p:83,t:78,w:205,a:3.6,ts:220,s:810,l:"A / A2 kit",
   r:"<b>The torque-first middleweight.</b> A 270° twin with a counterbalancer, bi-directional quickshifter as standard, and Showa SFF-BP forks.",
   v:"78 Nm is the most torque of any middleweight here. <span>It pulls where the R7 and RS 660 are still building revs</span>, at the cost of 20 kg."},
  {n:"GSX-R1000R",e:"999cc inline-four",es:"999 I4",p:202,t:118,w:203,a:3,ts:299,s:825,l:"A (EU: discontinued)",
   r:"<b>The variable valve timing superbike.</b> Suzuki's MotoGP-derived broad-range VVT system gives it a flatter torque curve than most literbikes, with Showa Balance Free forks.",
   v:"Withdrawn from Europe over Euro 5 and never replaced. <span>Still one of the friendliest superbikes ever built</span>, and now only available used here."}],
 notes:[["The GSX-R1000R left Europe","Suzuki confirmed the model would not be updated for Euro 5. New examples are no longer sold here, though the bike continues in other markets."],
        ["No 600 or 750 any more","The GSX-R600 and GSX-R750 both ended in Europe. The GSX-8R is the replacement in price, not in character."],
        ["The 125 is the class weight champion","134 kg wet is roughly 7 kg under the R125 and 14 kg under the Ninja 125, which matters more than any other number at this capacity."],
        ["The GSX-8R shares its engine widely","The same 776cc twin powers the GSX-8S and V-Strom 800, which makes parts availability and independent servicing straightforward."]]}
};

/* --- derived fields ---------------------------------------------------------
   ptw : power to weight, so it can be sorted like any other metric
   id  : unique within a brand — used as the card anchor the ladder scrolls to
   uid : unique across all brands — the row key both ladders are built on
--------------------------------------------------------------------------- */
Object.keys(SBL.DATA).forEach(function(brandKey){
  SBL.DATA[brandKey].bikes.forEach(function(bike, i){
    bike.ptw = bike.p / bike.w;
    bike.id  = bike.n.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + i;
    bike.uid = brandKey + "__" + bike.id;
  });
});

/* Every bike from every brand, flattened and tagged with its manufacturer.
   The compare view works exclusively from this list. */
SBL.ALL = [];
Object.keys(SBL.DATA).forEach(function(brandKey){
  var brand = SBL.DATA[brandKey];
  brand.bikes.forEach(function(bike){
    SBL.ALL.push(Object.assign({}, bike, {
      brand:  brand.name,
      bkey:   brandKey,
      accent: brand.accent
    }));
  });
});

window.SBL = SBL;
