// Rozhovor FAME z konferencie BIKOSS (posts/2026-10-video-bikoss). Text a časy z titulky-zdroj.txt, ktorý dodal
// zadávateľ; *slovo* = zvýraznené slovo. Opravy oproti zdroju: „Šulík“ → „Šulik“, „podporané“ → „podporené“,
// pri 53,7 s doplnené „a dojmov“, ktoré zaznie v reči (overené Whisperom); pri 15,2 s „Mne sa páčila“ podľa reči;
// pri 40,1 s „v COOP Jednote“ namiesto „BMW či Mercedes“ (Marek 2026-10-29).
// Záber: vľavo Patrícia Kollár, vpravo Marek Šulik.
//
// Strih (Marek 2026-10-29): 13,80–15,60 s je otázka mimo záberu („Patrí?“, „OK“) a ticho, vystrihnuté, aby po
// Patrícii hneď začal Marek. Videá clips/<formát>-cut.mp4 vznikli z pôvodných cez ffmpeg (trim + concat, 50 ms
// stlmenie na oboch stranách). Časy nižšie sú v pôvodnom čase videa a na čas po strihu ich prevádza at().
export type Line = { t0: number; t1: number; text: string };
export type Tag = { t0: number; t1: number; name: string; role: string; side: "left" | "right" };

const CUT = { from: 13.8, to: 15.6 };
const at = (t: number) => (t <= CUT.from ? t : t >= CUT.to ? t - (CUT.to - CUT.from) : CUT.from);
const shift = <T extends { t0: number; t1: number }>(xs: T[]) => xs.map((x) => ({ ...x, t0: at(x.t0), t1: at(x.t1) }));

const SOURCE = {
  duration: 63.23,
  formats: {
    "4x5": { src: "clips/4x5-cut.mp4", width: 1080, height: 1350 },
    "1x1": { src: "clips/1x1-cut.mp4", width: 1080, height: 1080 },
    "9x16": { src: "clips/9x16-cut.mp4", width: 1080, height: 1920 },
  },
  credit: "Rozhovor z konferencie BIKOSS",
  headlines: [
    { t0: 14.0, t1: 19.0, text: "Aký evidence-based prístup ste si všimli na BIKOSSe?" },
    // Pôvodná otázka „Čo dokážete pre OZ FAME?“ nesedela s odpoveďami; každá odpoveď má svoju (Marek 2026-10-29).
    { t0: 42.0, t1: 46.9, text: "Prečo sa oplatí prísť do OZ FAME?" },
    { t0: 47.1, t1: 52.1, text: "Čo očakávate od OZ FAME?" },
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
    { t0: 15.6, t1: 20.0, text: "Mne sa páčila myšlienka zakladateľa *Wikipédie* Jimmyho Walesa." },
    { t0: 20.0, t1: 24.0, text: "Hovoril, že bez *dôvery* by Wikipédia neexistovala." },
    { t0: 24.0, t1: 28.0, text: "Aj *marketing* bez dôvery nemôže existovať." },
    { t0: 29.2, t1: 34.0, text: "Vo väčšine *prednášok* sa kombinujú nielen dáta," },
    { t0: 34.0, t1: 40.0, text: "ale aj *zákonitosti*, ktoré fungujú a sú podporené reálnymi číslami." },
    { t0: 40.1, t1: 42.0, text: "Tak ako to ukázali v *COOP Jednote*." },
    { t0: 42.5, t1: 46.5, text: "Že sa určite *oplatí* prísť, lebo sme zábavní a múdri." },
    { t0: 47.0, t1: 50.6, text: "Moje očakávanie je, že sa nám podarí vybudovať tú *dôveru*," },
    { t0: 50.6, t1: 53.4, text: "o ktorej som hovoril," },
    { t0: 53.7, t1: 57.1, text: "a že stále viac ľudí nebude *marketing* hodnotiť podľa názorov a dojmov," },
    { t0: 57.1, t1: 60.3, text: "ale podľa *faktov*." },
    { t0: 60.6, t1: 62.0, text: "A hlavne podľa toho, čo *funguje*." },
  ] as Line[],
};

// Údaje v čase po strihu, ako ich používa OverlayClip.
export const BIKOSS = {
  ...SOURCE,
  duration: at(SOURCE.duration),
  headlines: shift(SOURCE.headlines),
  tags: shift(SOURCE.tags),
  lines: shift(SOURCE.lines),
};

export type BikossFormat = keyof typeof BIKOSS.formats;
