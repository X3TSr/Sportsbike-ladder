/* ==========================================================================
   MODEL YEARS — when each generation was on sale.

   Keyed by "<brandKey>|<model name>" rather than uid, so reordering a brand's
   bikes array can't silently repoint an entry.

     from  first model year of the CURRENT generation
     to    last model year, for models no longer sold new in the EU (optional)
     gens  earlier generations, newest first. Each carries from/to and only
           the fields that differed; everything else falls through to the
           current entry. `why` is shown on the card when that year is picked.

   Coverage is deliberately uneven and that is visible in the UI:

   - `from` is set for all 127 models. These are launch/redesign years for the
     generation currently on sale and are good to about ±1 year; a mid-cycle
     colour change is not treated as a new generation.
   - `gens` exists only where the previous generation's specs are actually
     known. That is 36 of the 127. Every other model shows its current spec
     for every year it was on sale, because inventing seven years of numbers
     for 127 bikes would make the whole spec sheet untrustworthy.

   A generation whose `to` reaches `from` is unreachable — the current entry
   would always win. derive.js warns about that case in the console.

   The year selector marks which models have real history so a reader can tell
   a genuine archive entry from a model that simply did not change.
   ========================================================================== */

SBL.YEAR_MIN = 2020;
SBL.YEAR_MAX = 2026;

SBL.YEARS = {

/* ---------------- Yamaha ---------------- */
"yamaha|R125":{from:2023},
"yamaha|R3":{from:2024},
"yamaha|R7":{from:2022},
"yamaha|R9":{from:2025},
"yamaha|R6 Race":{from:2021,
 gens:[{from:2017,to:2020,l:"A",why:"Road-legal R6. Euro 5 ended registration in 2020; it continues as the track-only R6 Race."}]},
"yamaha|R1":{from:2025,
 gens:[{from:2020,to:2024,l:"A",why:"Road-legal in the EU until Euro 5+. From 2025 the R1 is sold here as a track-only machine."}]},
"yamaha|MT-125":{from:2023},
"yamaha|MT-03":{from:2020},
"yamaha|MT-07":{from:2025,
 gens:[{from:2021,to:2024,w:184,a:3.6,why:"Second-generation CP2. The 2025 update brought new switchgear, a TFT dash and Euro 5+ compliance."}]},
"yamaha|MT-09":{from:2024,
 gens:[{from:2021,to:2023,w:189,s:825,why:"Second-generation 890cc CP3, 4 kg lighter than the current bike before the 2024 restyle added bodywork and a TFT dash."},
       {from:2017,to:2020,e:"847cc CP3 inline-triple",es:"847 I3",p:115,t:87.5,w:193,a:3.3,ts:225,s:820,why:"The original 847cc triple, before the 2021 capacity increase to 890cc."}]},
"yamaha|MT-10":{from:2022},
"yamaha|Tracer 7":{from:2021},
"yamaha|Tracer 9":{from:2021},
"yamaha|Ténéré 700":{from:2025,
 gens:[{from:2019,to:2024,w:204,s:875,why:"The original Ténéré 700. The 2025 update added a TFT dash, ride modes and switchable ABS."}]},
"yamaha|XSR125":{from:2021},
"yamaha|XSR700":{from:2022},
"yamaha|XSR900":{from:2022},
"yamaha|XSR900 GP":{from:2024},

/* ---------------- Kawasaki ---------------- */
"kawasaki|Ninja 125":{from:2019},
"kawasaki|Ninja 500":{from:2024,
 gens:[{from:2018,to:2023,n:"Ninja 400",e:"399cc parallel-twin",es:"399 twin",p:45,t:38,w:168,a:5.4,ts:180,s:785,why:"Sold as the Ninja 400. The 2024 Ninja 500 added 52cc and midrange on the same chassis."}]},
"kawasaki|Ninja 650":{from:2020},
"kawasaki|ZX-4RR":{from:2023},
"kawasaki|ZX-6R":{from:2024,
 gens:[{from:2019,to:2023,p:130,t:70,w:196,why:"Pre-Euro 5+ 636. The 2024 update brought new styling, revised suspension and emissions compliance."}]},
"kawasaki|ZX-10R":{from:2021},
"kawasaki|Ninja H2":{from:2019,to:2020},
"kawasaki|Ninja H2R":{from:2015},
"kawasaki|Z125":{from:2019},
"kawasaki|Z500":{from:2024,
 gens:[{from:2019,to:2023,n:"Z400",e:"399cc parallel-twin",es:"399 twin",p:45,t:38,w:167,a:5.3,ts:180,s:785,why:"Sold as the Z400 before the 2024 capacity increase."}]},
"kawasaki|Z650":{from:2020},
"kawasaki|Z900":{from:2025,
 gens:[{from:2020,to:2024,p:125,t:98.6,w:212,s:800,why:"Pre-Euro 5+ Z900. The 2025 update revised the electronics and bodywork."}]},
"kawasaki|Z H2":{from:2020},
"kawasaki|Ninja 1100SX":{from:2025,
 gens:[{from:2020,to:2024,n:"Ninja 1000SX",e:"1043cc inline-four",es:"1043 I4",p:142,t:111,w:235,a:3.1,ts:250,s:835,why:"Sold as the Ninja 1000SX. The 2025 model bored out to 1099cc, trading 6 PS for more midrange."}]},
"kawasaki|Ninja H2 SX":{from:2022},
"kawasaki|Versys-X 300":{from:2017,to:2020},
"kawasaki|Versys 650":{from:2022},
"kawasaki|Versys 1100":{from:2025,
 gens:[{from:2019,to:2024,n:"Versys 1000",e:"1043cc inline-four",es:"1043 I4",p:120,t:102,w:255,a:3.8,ts:220,s:840,why:"Sold as the Versys 1000 before the 2025 capacity increase to 1099cc."}]},
"kawasaki|Eliminator 500":{from:2024},
"kawasaki|Vulcan S":{from:2015},
"kawasaki|W230":{from:2025},
"kawasaki|Meguro S1":{from:2025},
"kawasaki|Z650RS":{from:2022},
"kawasaki|Z900RS":{from:2022,
 gens:[{from:2018,to:2021,p:111,t:98.5,w:215,s:800,why:"The original Z1 tribute, before the 2022 Euro 5 update and revised suspension."}]},
"kawasaki|W800":{from:2019},

/* ---------------- Honda ---------------- */
"honda|CBR500R":{from:2022},
"honda|CBR650R":{from:2024,
 gens:[{from:2019,to:2023,p:95,t:64,w:207,why:"Pre-E-Clutch CBR650R. The 2024 update added the optional automated clutch and new bodywork."}]},
"honda|CBR600RR":{from:2021},
"honda|CBR1000RR-R Fireblade":{from:2024,
 gens:[{from:2020,to:2023,p:217,w:201,a:2.9,why:"First-generation RR-R. The 2024 revision reworked the airbox, exhaust and aero for more midrange."}]},
"honda|CB125F":{from:2021},
"honda|CB125R":{from:2021},
"honda|CB500 Hornet":{from:2024,
 gens:[{from:2019,to:2023,n:"CB500F",p:48,t:43,w:189,s:789,why:"Sold as the CB500F before the 2024 Hornet restyle."}]},
"honda|CB650R":{from:2024,
 gens:[{from:2019,to:2023,p:95,t:64,w:202,why:"Pre-E-Clutch CB650R."}]},
"honda|CB750 Hornet":{from:2023},
"honda|CB1000 Hornet":{from:2025},
"honda|CB1000GT":{from:2026},
"honda|NT1100":{from:2022},
"honda|Gold Wing":{from:2021},
"honda|NX500":{from:2024,
 gens:[{from:2019,to:2023,n:"CB500X",p:48,t:43,w:199,s:830,why:"Sold as the CB500X. The 2024 NX500 restyled it and shed 3 kg, which the E-Clutch now sold in its place has put back."}]},
"honda|XL750 Transalp":{from:2023},
"honda|NC750X":{from:2021},
"honda|CRF1100L Africa Twin":{from:2024,
 gens:[{from:2020,to:2023,t:105,w:226,why:"First 1100 Africa Twin. The 2024 update added torque, a lighter subframe and revised electronics."}]},
"honda|CMX500 Rebel":{from:2020},
"honda|CMX1100 Rebel":{from:2021},
"honda|CB1000F":{from:2026},
"honda|CL500":{from:2023},
"honda|GB350S":{from:2025},

/* ---------------- Aprilia ---------------- */
"aprilia|RS 125":{from:2021},
"aprilia|RS 457":{from:2024},
"aprilia|RS 660":{from:2020},
"aprilia|RSV4":{from:2021},
"aprilia|Tuono 125":{from:2021},
"aprilia|Tuono 457":{from:2025},
"aprilia|Tuono 660":{from:2021},
"aprilia|Tuono V4":{from:2025,
 gens:[{from:2021,to:2024,e:"1077cc 65° V4",es:"1077 V4",p:175,t:121,w:209,why:"The 1077cc Tuono V4, before the 2025 increase to 1099cc and the revised exhaust and winglets."}]},
"aprilia|Tuareg 660":{from:2022},

/* ---------------- Ducati ---------------- */
"ducati|Panigale V2":{from:2025,
 gens:[{from:2020,to:2024,e:"955cc 90° V2 (desmodromic)",es:"955 V2",p:155,t:104,w:200,a:3.2,ts:270,s:840,why:"The 955cc desmodromic V2. The 2025 redesign dropped to 890cc and 120 PS, ditched desmo valves and shed 9 kg."}]},
"ducati|Panigale V4":{from:2025,
 gens:[{from:2022,to:2024,p:215,t:123,w:198,a:2.8,why:"Sixth-generation V4, before the 2025 hollow symmetrical swingarm and revised front frame."}]},
"ducati|Panigale V4 R":{from:2023},
"ducati|Superleggera V4":{from:2020},
"ducati|Monster":{from:2026,
 gens:[{from:2021,to:2025,e:"937cc 90° V2",es:"937 V2",p:111,t:93,w:188,s:820,why:"The 937cc Monster. The 2026 fifth generation moved to the 890 V2 with variable intake timing and 45,000 km valve intervals."}]},
"ducati|Streetfighter V2":{from:2025,
 gens:[{from:2022,to:2024,e:"955cc 90° V2 (desmodromic)",es:"955 V2",p:153,t:101,w:200,a:3.2,ts:265,s:845,why:"The 955cc desmodromic Streetfighter, retired alongside the Panigale V2 it was based on."}]},
"ducati|Streetfighter V4":{from:2023},
"ducati|Hypermotard V2":{from:2025,
 gens:[{from:2022,to:2024,n:"Hypermotard 950",e:"937cc 90° V2",es:"937 V2",p:114,t:96,w:200,a:3.4,ts:225,s:870,why:"Sold as the Hypermotard 950. The 2025 V2 is 10 kg lighter with a sportier riding position."}]},
"ducati|Multistrada V2":{from:2025,
 gens:[{from:2022,to:2024,e:"937cc 90° V2",es:"937 V2",p:113,t:96,w:225,a:3.7,s:830,why:"The 937cc Multistrada V2, 23 kg heavier than the 2025 replacement."}]},
"ducati|Multistrada V4":{from:2025,
 gens:[{from:2021,to:2024,t:125,w:243,why:"First-generation V4 Multistrada, before the 2025 chassis and electronics revision."}]},
"ducati|DesertX":{from:2026,
 gens:[{from:2022,to:2025,e:"937cc 90° V2",es:"937 V2",p:110,t:92,w:223,s:875,why:"The 937cc DesertX. The 2026 second generation moved to the 890 V2 with a new monocoque frame and an 18-litre polymer tank."}]},
"ducati|Diavel V4":{from:2023},
"ducati|XDiavel V4":{from:2025},
"ducati|Scrambler 800":{from:2023},

/* ---------------- Suzuki ---------------- */
"suzuki|GSX-R125":{from:2017},
"suzuki|GSX-8R":{from:2024},
"suzuki|GSX-R1000R":{from:2017,to:2022},
"suzuki|Hayabusa":{from:2021},
"suzuki|GSX-S125":{from:2017},
"suzuki|SV650":{from:2016},
"suzuki|GSX-8S":{from:2023},
"suzuki|GSX-S1000":{from:2021},
"suzuki|Katana":{from:2022},
"suzuki|GSX-S1000GT":{from:2022},
"suzuki|GSX-S1000GX":{from:2024},
"suzuki|SV-7GX":{from:2026},
"suzuki|V-Strom 800":{from:2023},
"suzuki|V-Strom 1050":{from:2023,
 gens:[{from:2020,to:2022,p:107,w:247,why:"Pre-DE V-Strom 1050, before the 2023 update added the DE variant and revised electronics."}]},
"suzuki|GSX-8T":{from:2026},
"suzuki|SV650X":{from:2018},

/* ---------------- BMW ---------------- */
"bmw|S 1000 RR":{from:2023,
 gens:[{from:2019,to:2022,p:207,t:113,w:197,why:"The 2019 ShiftCam generation, before the 2023 aero package and 3 PS increase."}]},
"bmw|M 1000 RR":{from:2023,
 gens:[{from:2021,to:2022,p:212,w:192,ts:306,why:"First-generation M RR, before the 2023 winglet redesign raised top speed."}]},
"bmw|G 310 R":{from:2021},
"bmw|F 900 R":{from:2020},
"bmw|R 1300 R":{from:2026},
"bmw|S 1000 R":{from:2021},
"bmw|M 1000 R":{from:2023},
"bmw|F 900 XR":{from:2020},
"bmw|R 1300 RS":{from:2026,
 gens:[{from:2020,to:2025,n:"R 1250 RS",e:"1254cc boxer twin",es:"1254 boxer",p:136,t:143,w:243,a:3.4,ts:220,s:820,why:"Sold as the R 1250 RS on the ShiftCam 1250 boxer, replaced by the 1300 for 2026."}]},
"bmw|S 1000 XR":{from:2020},
"bmw|M 1000 XR":{from:2024},
"bmw|R 1300 RT":{from:2026,
 gens:[{from:2021,to:2025,n:"R 1250 RT",e:"1254cc boxer twin",es:"1254 boxer",p:136,t:143,w:279,a:3.8,ts:200,s:805,why:"Sold as the R 1250 RT, replaced by the 1300 for 2026."}]},
"bmw|K 1600 GT":{from:2022},
"bmw|G 310 GS":{from:2021},
"bmw|F 450 GS":{from:2026},
"bmw|F 800 GS":{from:2024,
 gens:[{from:2018,to:2023,n:"F 750 GS",e:"853cc parallel-twin",es:"853 twin",p:77,t:83,w:227,a:4.4,ts:180,s:815,why:"Sold as the F 750 GS on the 853cc twin, renamed and re-engined for 2024."}]},
"bmw|F 900 GS":{from:2024,
 gens:[{from:2018,to:2023,n:"F 850 GS",e:"853cc parallel-twin",es:"853 twin",p:95,t:92,w:229,a:4,ts:200,s:860,why:"Sold as the F 850 GS. The 2024 F 900 GS shed 14 kg with a plastic tank and lighter exhaust."}]},
"bmw|R 1300 GS":{from:2024,
 gens:[{from:2019,to:2023,n:"R 1250 GS",e:"1254cc boxer twin",es:"1254 boxer",p:136,t:143,w:249,a:3.5,ts:200,s:850,why:"Sold as the R 1250 GS. The 2024 R 1300 GS is 12 kg lighter and 9 PS up, on a new sheet-metal main frame."}]},
"bmw|R 18":{from:2020},
"bmw|R 12":{from:2024},
"bmw|R 12 nineT":{from:2024,
 gens:[{from:2017,to:2023,n:"R nineT",p:109,t:116,w:221,s:785,why:"Sold as the R nineT before the 2024 R 12 platform update."}]},
"bmw|R 12 G/S":{from:2025},
"bmw|R 12 S":{from:2026}
};
