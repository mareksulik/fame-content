// Rozhovor FAME z konferencie BIKOSS (posts/2026-10-video-bikoss). Text a časy z titulky-zdroj.txt, ktorý dodal
// zadávateľ; *slovo* = zvýraznené slovo. Opravy oproti zdroju: „Šulík“ → „Šulik“, „podporané“ → „podporené“,
// pri 53,7 s doplnené „a dojmov“, ktoré zaznie v reči (overené Whisperom).
// Záber: vľavo Patrícia Kollár, vpravo Marek Šulik.
export type Line = { t0: number; t1: number; text: string };
export type Tag = { t0: number; t1: number; name: string; role: string; side: "left" | "right" };

export const BIKOSS = {
  duration: 63.23,
  formats: {
    "4x5": { src: "clips/4x5.mp4", width: 1080, height: 1350 },
    "1x1": { src: "clips/1x1.mp4", width: 1080, height: 1080 },
    "9x16": { src: "clips/9x16.mp4", width: 1080, height: 1920 },
  },
  credit: "Rozhovor z konferencie BIKOSS",
  headlines: [
    { t0: 14.0, t1: 19.0, text: "Aký evidence-based prístup ste si všimli na BIKOSSe?" },
    { t0: 42.0, t1: 47.0, text: "Čo dokážete pre OZ FAME?" },
  ] as Line[],
  tags: [
    { t0: 0.3, t1: 5.8, name: "Marek Šulik", role: "spoluzakladateľ BIRNE · podpredseda OZ FAME", side: "right" },
    { t0: 6.6, t1: 13.8, name: "Patrícia Kollár", role: "2MUSE · spoluzakladateľka OZ FAME", side: "left" },
  ] as Tag[],
  lines: [
    { t0: 0.0, t1: 3.0, text: "Čaute, som *Marek Šulik*," },
    { t0: 3.0, t1: 5.8, text: "*spoluzakladateľ* marketingového štúdia BIRNE a podpredseda OZ FAME." },
    { t0: 6.6, t1: 10.0, text: "Ja som *Patrícia Kollár*, pracujem v prieskumnej agentúre 2MUSE." },
    { t0: 10.0, t1: 13.8, text: "Tiež som *spoluzakladateľka* OZ FAME." },
    { t0: 15.2, t1: 20.0, text: "Páčila sa mi myšlienka zakladateľa *Wikipédie* Jimmyho Walesa." },
    { t0: 20.0, t1: 24.0, text: "Hovoril, že bez *dôvery* by Wikipédia neexistovala." },
    { t0: 24.0, t1: 28.0, text: "Aj *marketing* bez dôvery nemôže existovať." },
    { t0: 29.2, t1: 34.0, text: "Vo väčšine *prednášok* sa kombinujú nielen dáta," },
    { t0: 34.0, t1: 40.0, text: "ale aj *zákonitosti*, ktoré fungujú a sú podporené reálnymi číslami." },
    { t0: 40.1, t1: 42.0, text: "Tak ako to ukázali napríklad BMW či *Mercedes*." },
    { t0: 42.5, t1: 46.5, text: "Že sa určite *oplatí* prísť, lebo sme zábavní a múdri." },
    { t0: 47.0, t1: 50.6, text: "Moje očakávanie je, že sa nám podarí vybudovať tú *dôveru*," },
    { t0: 50.6, t1: 53.4, text: "o ktorej som hovoril," },
    { t0: 53.7, t1: 57.1, text: "a že stále viac ľudí nebude *marketing* hodnotiť podľa názorov a dojmov," },
    { t0: 57.1, t1: 60.3, text: "ale podľa *faktov*." },
    { t0: 60.6, t1: 62.0, text: "A hlavne podľa toho, čo *funguje*." },
  ] as Line[],
};

export type BikossFormat = keyof typeof BIKOSS.formats;
