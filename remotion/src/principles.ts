// 10 princípov z manifestu FAME (fame-web/web/src/content/manifest.json): názvy doslovne,
// texty doslovne alebo skrátené po vetách, rovnako ako carousel posts/2026-10-linkedin-principy.
export type Principle = { n: number; title: string; body: string };

export const PRINCIPLES: Principle[] = [
  { n: 1, title: "Marketing je disciplína rastu a rozhodovania, nie iba komunikácie", body: "Marketing sa nezačína ani nekončí otázkou „Akú kampaň urobíme?“. Je to strategická disciplína naprieč celými 4P." },
  { n: 2, title: "Rozlišujeme silu dôkazov", body: "Nie všetky dáta a tvrdenia majú rovnakú váhu. Metaanalýza, experiment či opakovane replikovaný empirický vzorec sú iným typom dôkazu než komerčný report, prípadová štúdia, expertný rámec alebo skúsenosť jedného človeka." },
  { n: 3, title: "Značky rastú najmä tým, že získavajú viac kupujúcich", body: "Vo väčšine trhov rastú značky najmä rozširovaním penetrácie. Lojalita, retencia a vzťahy so zákazníkmi majú svoje miesto, samy osebe však zvyčajne nestačia na výraznejší rast." },
  { n: 4, title: "Budujeme mentálnu a fyzickú dostupnosť", body: "Značka má väčšiu šancu dostať sa do výberu, keď si ju ľudia ľahko vybavia v nákupných situáciách a zároveň ju môžu ľahko nájsť, pochopiť a kúpiť." },
  { n: 5, title: "Značku budujeme aj pre budúcich kupujúcich", body: "V každom okamihu je veľká časť budúcich kupujúcich mimo nákupného okna. Krátkodobá aktivácia pomáha zachytávať existujúci dopyt." },
  { n: 6, title: "Meranie má pomáhať rozhodovať, nie vytvárať ilúziu presnosti", body: "Digitálna atribúcia nie je automaticky dôkazom inkrementality. Retargeting si môže pripísať ľudí, ktorí by nakúpili aj bez neho." },
  { n: 7, title: "Reklama pracuje s pozornosťou, pamäťou a emóciou", body: "Ľudia reklamu väčšinou nehľadajú a značkám venujú málo pozornosti. Úlohou reklamy preto často nie je iba presviedčať, ale najmä vytvárať a osviežovať pamäťové stopy." },
  { n: 8, title: "B2B, služby a komplexné produkty nie sú výnimkou z ľudského rozhodovania", body: "Dlhší nákupný cyklus, vyššie riziko a viac rozhodovateľov menia nákupný proces, nie základné princípy ľudskej psychológie." },
  { n: 9, title: "Cenu, promo akcie, lojalitu a zákaznícku skúsenosť posudzujeme v realite trhu", body: "Zľavy a akcie môžu krátkodobo zvýšiť predaj, no časť ich efektu často tvoria existujúci zákazníci alebo nákupy presunuté v čase." },
  { n: 10, title: "Marketing musí hovoriť jazykom financií a biznis stratégie", body: "Ak má byť marketing súčasťou riadenia firmy, nestačí hovoriť o impresiách, klikoch, engagemente či kreativite." },
];

// Slovenská typografia: nezlomiteľná medzera za jednopísmenovými predložkami a spojkami.
export const nb = (s: string) => s.replace(/(^|[\s(„])([aikosuvzAIKOSUVZ]) /g, "$1$2 ");

// Farba dlaždice v sérii: žltá, tyrkysová, červená a znova, takže susedné videá majú rôznu farbu.
export const TONES = ["yellow", "teal", "red"] as const;
