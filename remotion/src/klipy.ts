// Klipy z rozhovoru 2museCast „Je Patri FAME?“ (posts/2026-10-video-2musecast-klipy, časy v klipy.tsv).
// Časy slov v sekundách od začiatku klipu: lokálny whisper.cpp (large-v3-turbo, --dtw), text ručne opravený
// podľa záznamu; vynechané sú iba výplňové slová („akože“, „hej“). host = otázka moderátora, br = nová strana titulkov.
export type Word = { w: string; t0: number; t1: number; br?: boolean; host?: boolean; next?: number };

// Klipy od marek-2 vyššie: text v posts/…/titulky/<id>.txt, časy spárované cez scripts/align-captions.ts.
import * as marek2 from "./titulky/marek-2.ts";
import * as marek3 from "./titulky/marek-3.ts";
import * as marek4 from "./titulky/marek-4.ts";
import * as marek5 from "./titulky/marek-5.ts";
import * as roman2 from "./titulky/roman-2.ts";
import * as roman3 from "./titulky/roman-3.ts";
import * as roman4 from "./titulky/roman-4.ts";
import * as roman5 from "./titulky/roman-5.ts";
import * as roman6 from "./titulky/roman-6.ts";

const MAREK = { speaker: "Marek Šulik", role: "stratég, Birne · spoluzakladateľ FAME" };
const ROMAN = { speaker: "Roman Jazudek", role: "Slovenská sporiteľňa · spoluzakladateľ FAME" };

type Klip = {
  src: string; // v public dire postu
  duration: number; // dĺžka záberu v sekundách
  title: string;
  speaker: string;
  role: string;
  speakerFrom: number; // kedy sa ukáže menovka
  words: Word[];
};

// [slovo, od, do] v milisekundách, ako ich vypisuje whisper-cli -ocsv.
const w = (rows: [string, number, number, ("br" | "host" | "br-host")?][]): Word[] =>
  rows.map(([text, a, b, f]) => ({ w: text, t0: a / 1000, t1: b / 1000, br: f?.startsWith("br"), host: f?.endsWith("host") }));

export const KLIPY = {
  "marek-1": {
    src: "clips/marek-1.mp4",
    duration: 25.2,
    title: "Marketérom chýba vzdelanie alebo dobré zdroje",
    speaker: "Marek Šulik",
    role: "stratég, Birne · spoluzakladateľ FAME",
    speakerFrom: 2.1,
    words: w([
      ["Ty", 110, 130, "host"], ["sa", 130, 330, "host"], ["Marek", 330, 660, "host"], ["asi", 660, 830, "host"],
      ["stretávaš", 830, 1480, "host"], ["s", 1480, 1540, "host"], ["mnohými.", 1540, 2100, "host"],
      ["Záleží.", 2100, 2550, "br"], ["Je", 2550, 2620], ["to", 2620, 2750], ["záleží.", 2750, 3260],
      ["Vo", 3630, 3760, "br"], ["všeobecnosti", 3760, 4680], ["áno.", 4680, 5100],
      ["Ja", 5100, 5190, "br"], ["si", 5190, 5280], ["nemyslím,", 5280, 5800], ["že", 5800, 5960], ["to", 5960, 6070], ["je", 6070, 6180],
      ["nejaký", 6180, 6550], ["problém", 6550, 6980], ["Slovenska", 6980, 7500], ["ako", 7500, 7630], ["takého.", 7630, 8100],
      ["Vo", 8100, 8230, "br"], ["všeobecnosti", 8230, 8900], ["môžeme", 8900, 9350], ["povedať,", 9350, 9880], ["že", 9880, 10040],
      ["marketérom", 10040, 10740], ["buď", 11050, 11290], ["chýba", 11290, 11650], ["formálne", 11650, 12210], ["vzdelanie,", 12210, 12840],
      ["alebo", 12840, 13210, "br"], ["sa", 13210, 13360], ["opierajú", 13360, 14090], ["o", 14090, 14100], ["zdroje,", 14100, 14700],
      ["ktoré", 14700, 15140], ["si", 15140, 15400], ["nezaslúžia,", 15400, 16180], ["aby", 16180, 16400], ["sa", 16400, 16550], ["o", 16550, 16620],
      ["ne", 16620, 16770], ["niekto", 16770, 17210], ["opieral.", 17210, 17960],
      ["Čiže", 18140, 18650, "br"], ["z", 18650, 18740], ["môjho", 18740, 19250], ["pohľadu", 19250, 19920], ["to", 19920, 20090], ["je", 20090, 20420],
      ["vec,", 20420, 20690], ["ktorá", 20690, 21210], ["sa", 21210, 21380], ["netýka", 21380, 21980], ["iba", 21980, 22240], ["Slovenska,", 22240, 23200],
      ["ale", 23200, 23460], ["má", 23460, 23720], ["zmysel.", 23720, 24400],
    ]),
  },
  "roman-1": {
    src: "clips/roman-1.mp4",
    duration: 86.05,
    title: "Čo je FAME a prečo vzniklo",
    speaker: "Roman Jazudek",
    role: "Slovenská sporiteľňa · spoluzakladateľ FAME",
    speakerFrom: 0.1,
    words: w([
      ["FAME", 100, 780], ["sú", 780, 1110], ["to", 1110, 1330], ["vlastne", 1330, 2140], ["priatelia", 2140, 2660],
      ["aplikovanej", 2660, 3420], ["marketingovej", 3420, 4100], ["vedy.", 4100, 4340],
      ["Vymysleli", 4340, 5040, "br"], ["sme", 5040, 5180], ["si", 5180, 5320], ["takýto", 5320, 5810], ["názov,", 5810, 6410],
      ["lebo", 6410, 7120], ["byť", 7720, 8420], ["FAME", 8420, 9140], ["v", 9140, 9220], ["reklame", 9220, 9800],
      ["je", 9800, 9900], ["jeden", 9900, 10320], ["z", 10320, 10340], ["kvázi", 10340, 10850], ["princípov", 10850, 11850],
      ["evidence-based", 11850, 12660], ["marketingu,", 12660, 13440], ["aj", 13440, 13540, "br"], ["keď", 13540, 13740], ["aj", 13740, 13840],
      ["o", 13840, 13890], ["tom", 13890, 14040], ["sa", 14040, 14140], ["dá", 14140, 14290], ["diskutovať.", 14290, 15000],
      ["FAME", 15000, 15410, "br-host"], ["ako", 15410, 15720, "host"], ["sláva.", 15720, 16680, "host"],
      ["FAME", 16680, 16940, "br"], ["ako", 16940, 17140], ["sláva.", 17140, 17660], ["Rišo", 17660, 18040], ["Mareček", 18040, 18580],
      ["to", 18580, 18690], ["miluje,", 18690, 19220], ["ale", 19220, 19420, "br"], ["nie", 19420, 19690], ["preto", 19690, 19950], ["sa", 19950, 20080],
      ["voláme", 20080, 20540], ["FAME,", 20540, 21250], ["že", 21250, 21300], ["to", 21300, 21390], ["miluje", 21390, 21650], ["Rišo,", 21650, 22060],
      ["ale", 22060, 22290, "br"], ["preto,", 22290, 22800], ["že", 22800, 23020], ["nám", 23020, 23310], ["to", 23310, 23460], ["tak", 23460, 23690],
      ["vyšlo.", 23690, 24130], ["Hľadali", 24920, 25380, "br"], ["sme", 25380, 25500], ["nejaký", 25500, 25680], ["chytľavý,", 25680, 25970],
      ["zaujímavý", 25970, 26350], ["názov,", 26350, 26840], ["ktorý", 26840, 27140], ["by", 27140, 27240], ["nás", 27240, 27440],
      ["trošku", 27890, 28240], ["odlíšil", 28240, 28730], ["od", 28730, 28900], ["ostatných", 28900, 29140], ["organizácií.", 29140, 29820],
      ["Ale", 29950, 30150, "br"], ["o", 30150, 30200], ["to", 30200, 30260], ["vlastne", 30260, 30520], ["nejde.", 30520, 31080],
      ["Ide", 31080, 31310, "br"], ["o", 31780, 31850], ["to,", 31850, 32130], ["že", 32130, 32340], ["sme", 32340, 32550], ["cítili", 32550, 33180],
      ["v", 33180, 33290], ["podstate", 33290, 33810], ["deviati,", 33810, 34370], ["sme", 34370, 34580, "br"], ["tam", 34580, 34840],
      ["spoluzakladatelia,", 34840, 36260], ["sme", 36260, 36510, "br"], ["cítili", 36510, 37090], ["nejakú", 37090, 37660], ["takú", 37660, 38070],
      ["spoločnú", 38070, 38880], ["potrebu", 38880, 39450], ["pri", 41920, 42230], ["pive,", 42230, 42900],
      ["že", 42900, 43130, "br"], ["by", 43130, 43280], ["bolo", 43280, 43600], ["fajn", 43600, 43880], ["skúsiť", 44540, 45010], ["dať", 45010, 45310],
      ["dokopy", 45310, 45770], ["komunitu", 45770, 46390], ["ľudí,", 46390, 46980], ["ktorí", 46980, 47600, "br"], ["majú", 47600, 47810], ["radi", 47810, 48190],
      ["evidence-based", 48190, 49270], ["marketing,", 49270, 50360], ["ktorí", 50360, 50880, "br"], ["radi", 50880, 51310], ["čítajú", 51660, 52350],
      ["nielen", 52350, 52890], ["Sharpa,", 52890, 53400], ["ale", 53400, 53490], ["aj", 53490, 53600], ["iné", 53600, 53840], ["múdre", 53840, 54360],
      ["knižky,", 54360, 55050], ["reporty", 55080, 55690], ["a", 55690, 55750], ["štúdie.", 55750, 56440],
      ["A", 58270, 58310, "br"], ["proste", 58310, 58620], ["zrazu", 58620, 58870], ["nám", 58870, 59070], ["to", 59070, 59170], ["vyšlo", 59170, 59470],
      ["tak,", 59470, 59900], ["že", 59900, 60000], ["nás", 60000, 60350], ["tam", 60350, 60520], ["je", 60520, 60600], ["deväť", 60600, 60870],
      ["ľudí,", 60870, 61820], ["ktorí", 61820, 62120, "br"], ["reprezentujú", 62120, 62780], ["nielen", 62780, 63260], ["tú", 63260, 63500],
      ["klientsku", 63500, 64040], ["stranu", 64040, 64400], ["alebo", 64400, 64680], ["agentúrnu,", 64680, 65230], ["ale", 65230, 65280],
      ["napríklad", 65280, 65830], ["aj", 65830, 66040], ["tú", 66040, 66110], ["prieskumnú", 66110, 66780], ["a", 66780, 66930], ["mediálnu.", 66930, 68140],
      ["A", 68140, 68230, "br"], ["naším", 69100, 69780], ["cieľom", 71150, 71900], ["alebo", 71900, 72150], ["tou", 72150, 72300],
      ["ambíciou", 72300, 72840], ["je", 72840, 72940], ["skúsiť", 72940, 73500], ["dať", 73500, 73800], ["dokopy", 73800, 74280],
      ["komunitu", 74280, 74690], ["ľudí,", 74690, 75120], ["ktorí", 77740, 78260, "br"], ["si", 78260, 78440], ["myslia,", 78440, 79180],
      ["že", 79180, 79790], ["je", 79790, 79830], ["čas", 79830, 80300], ["posunúť", 80660, 81160], ["kvalitu", 81160, 81560],
      ["marketingu", 81860, 82620], ["na", 83220, 83340], ["Slovensku", 83340, 84000], ["trošku", 84000, 84420], ["ďalej", 84420, 84900],
      ["dopredu.", 84900, 85560],
    ]),
  },
  "marek-2": { src: "clips/marek-2.mp4", duration: 39.97, title: "Zlé dáta sú ako žiadne dáta", ...MAREK, ...marek2 },
  "marek-3": { src: "clips/marek-3.mp4", duration: 60.62, title: "How Brands Grow nie je len jedna knižka", ...MAREK, ...marek3, speakerFrom: 0.1 },
  "marek-4": { src: "clips/marek-4.mp4", duration: 39.9, title: "Len mentálna dostupnosť nestačí", ...MAREK, ...marek4 },
  "marek-5": { src: "clips/marek-5.mp4", duration: 87.75, title: "Čo je Ebbie a z čoho odpovedá", ...MAREK, ...marek5 },
  "roman-2": { src: "clips/roman-2.mp4", duration: 37.0, title: "Zákon, alebo zákonitosť?", ...ROMAN, ...roman2 },
  "roman-3": { src: "clips/roman-3.mp4", duration: 77.57, title: "Na Slovensku to vraj funguje inak", ...ROMAN, ...roman3 },
  "roman-4": { src: "clips/roman-4.mp4", duration: 87.42, title: "Marketing patrí k\u00a0rozhodovaciemu stolu", ...ROMAN, ...roman4 },
  "roman-5": { src: "clips/roman-5.mp4", duration: 63.83, title: "Podľa čoho poznáme, že sa FAME podarilo", ...ROMAN, ...roman5 },
  "roman-6": { src: "clips/roman-6.mp4", duration: 50.95, title: "Mentálna a fyzická dostupnosť sa nedajú oddeliť", ...ROMAN, ...roman6 },
} satisfies Record<string, Klip>;
