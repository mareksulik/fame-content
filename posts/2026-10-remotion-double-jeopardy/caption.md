# Zákony marketingu 01: double jeopardy

Video 4:5 a 9:16, 54 s, bez zvuku: `out/fame-double-jeopardy-4x5.mp4`, `out/fame-double-jeopardy-9x16.mp4`
(Remotion, kompozície `DoubleJeopardy-4x5` a `DoubleJeopardy-9x16`, render `sh remotion/render-double-jeopardy.sh`).
Všetky čísla pochádzajú zo simulácie 1 000 zákazníkov so seedom v `remotion/src/DoubleJeopardy.tsx`
(zjednodušený model NBD-Dirichlet: rovnaké koleso pre všetkých, počet nákupov za rok sa medzi ľuďmi líši).

## Scény

1. Prečo malé značky prehrávajú dvakrát?
2. Nákupy ako ruleta: šírka výseku zodpovedá podielu značky (A 40 %, B 30 %, C 20 %, D 10 %).
3. Jeden zákazník: štyri nákupy, malú značku D trafí raz.
4. 1 000 zákazníkov točí rovnakým kolesom.
5. Prvá strata, menej kupujúcich: A si kúpilo 646 ľudí, D iba 248.
6. Druhá strata, menej nákupov: 1,7 oproti 1,2 nákupu na kupujúceho.
7. Prečo kupujú zriedkavejšie: kto začal značkou A, trafí ju znova pri 40 % zatočení, kto začal D, iba pri 10 %. Jeden nákup má každý kupujúci istý, preto je druhá strata menšia.
8. Výsek je trhový podiel: nikto tu značku D nemá menej rád, má iba menší podiel.
Záver: Podiel nerastie vernosťou. Rastie počtom kupujúcich. Väčší trhový podiel získate, keď si na značku spomenie a kúpi ju viac ľudí. fameworks.sk/manifest

## Text príspevku

Prečo malé značky prehrávajú dvakrát?

Predstavte si každý nákup ako jedno zatočenie ruletou. Šírka výseku zodpovedá podielu značky na trhu. Všetci zákazníci točia rovnakým kolesom a nikto nemá žiadnu značku radšej.

Keď takto nakupuje 1 000 zákazníkov, malá značka s 10 % podielom prehrá dvakrát. Kúpi si ju oveľa menej ľudí (248 oproti 646 pri veľkej značke) a tí, čo si ju kúpia, ju kupujú zriedkavejšie (1,2-krát oproti 1,7-krát).

Prečo zriedkavejšie? Každý ďalší nákup je nové zatočenie toho istého kolesa. Kto začal veľkou značkou, trafí ju znova pri 40 % zatočení, kto začal malou, iba pri 10 %. Jeden nákup má však každý kupujúci istý a šírka výseku rozhoduje iba o opakovaných nákupoch. Preto je rozdiel vo vernosti oveľa menší ako rozdiel v počte kupujúcich.

Andrew Ehrenberg a jeho kolegovia tento vzorec opakovane našli v desiatkach kategórií, od pracích prostriedkov po autá a televízne kanály. Volá sa double jeopardy. Simulácia ukazuje, že na jeho vznik netreba emócie ani menej verných zákazníkov. Stačí menší trhový podiel, teda užší výsek na rulete.

Podiel preto nerastie vernosťou, ale počtom kupujúcich. Malá značka nedobehne veľkú tým, že bude stavať na vernosti. Väčší trhový podiel získa, keď si na ňu spomenie a kúpi ju viac ľudí.

Video je zjednodušený model NBD-Dirichlet (Goodhardt, Ehrenberg, Chatfield, 1984). Skutoční zákazníci sa líšia aj tým, ktoré značky majú radšej, vzorec však ostáva rovnaký: veľký rozdiel v počte kupujúcich, malý vo vernosti.

fameworks.sk/manifest
