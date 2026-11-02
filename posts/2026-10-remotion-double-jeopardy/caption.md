# Zákony marketingu 01: double jeopardy

Video 4:5 a 9:16, 60 s, bez zvuku: `out/fame-double-jeopardy-4x5.mp4`, `out/fame-double-jeopardy-9x16.mp4`
(Remotion, kompozície `DoubleJeopardy-4x5` a `DoubleJeopardy-9x16`, render `sh remotion/render-double-jeopardy.sh`).
Všetky čísla pochádzajú zo simulácie 1 000 zákazníkov so seedom v `remotion/src/DoubleJeopardy.tsx`
(zjednodušený model NBD-Dirichlet: rovnaké koleso pre všetkých, počet nákupov za rok sa medzi ľuďmi líši).

## Scény

1. Prečo malé značky prehrávajú dvakrát?
2. Repertoár ako ruleta: zákazník strieda štyri značky, šírka výseku ukazuje, ako často siahne po ktorej (A 40 %, B 30 %, C 20 %, D 10 %).
3. Jeden zákazník: štyri nákupy, malú značku D vyberie raz.
4. 1 000 zákazníkov striedajú rovnaké štyri značky.
5. Prvá strata, menej kupujúcich: A si kúpilo 646 ľudí, D iba 248.
6. Druhá strata, menej nákupov: 1,7 oproti 1,2 nákupu na kupujúceho.
7. Prečo kupujú zriedkavejšie: kto začal značkou A, vyberie ju znova pri 40 % ďalších nákupov, kto začal D, iba pri 10 %. Jeden nákup má každý kupujúci istý, preto je druhá strata menšia.
8. Výsek je trhový podiel: D nemá menej verných zákazníkov, má len menší podiel v repertoári všetkých.
9. Ako sa výsek rozširuje: keď si na značku spomenie a nájde ju v obchode viac ľudí. Pri podiele D 20 % namiesto 10 % (tí istí ľudia, rovnaký seed) pribudne kupujúcich o 64 % (248 → 407), nákupy na kupujúceho stúpnu len z 1,2 na 1,4.
Záver: Podiel nerastie vernosťou. Rastie počtom kupujúcich. Malá značka preto rastie, keď osloví všetkých, ktorí kategóriu kupujú, nielen svojich zákazníkov. fameworks.sk/manifest

## Text príspevku

Prečo malé značky prehrávajú dvakrát?

Zákazníci nekupujú jednu značku. Majú repertoár niekoľkých značiek a striedajú ich. Predstavte si ho ako ruletu: každý nákup je jedno zatočenie a šírka výseku ukazuje, ako často zákazník siahne po ktorej značke. Nie je to náhoda, ale zvyk, ktorý sa navonok správa ako pravdepodobnosť. Andrew Ehrenberg to opísal ako nákupy „akoby náhodné“. V simulácii majú všetci zákazníci rovnaký repertoár.

Keď takto nakupuje 1 000 zákazníkov, malá značka s 10 % podielom prehrá dvakrát. Kúpi si ju oveľa menej ľudí (248 oproti 646 pri veľkej značke) a tí, čo si ju kúpia, ju kupujú zriedkavejšie (1,2-krát oproti 1,7-krát).

Prečo zriedkavejšie? Pri každom ďalšom nákupe zákazník znova vyberá z celého repertoáru. Kto začal veľkou značkou, vyberie ju znova pri 40 % ďalších nákupov, kto začal malou, iba pri 10 %. Jeden nákup má však každý kupujúci istý a šírka výseku rozhoduje iba o opakovaných nákupoch. Preto je rozdiel vo vernosti oveľa menší ako rozdiel v počte kupujúcich.

Andrew Ehrenberg a jeho kolegovia tento vzorec opakovane našli v desiatkach kategórií, od pracích prostriedkov po autá a televízne kanály. Volá sa double jeopardy. Simulácia ukazuje, že na jeho vznik netreba emócie ani menej verných zákazníkov. Stačí menší trhový podiel, teda menší podiel v repertoári zákazníkov.

Funguje to aj opačne. Výsek sa rozšíri, keď si na značku spomenie a nájde ju v obchode viac ľudí. Keď v simulácii zdvojnásobíme podiel malej značky z 10 na 20 %, kupujúcich pribudne o 64 % (z 248 na 407), no nákupy na kupujúceho stúpnu len z 1,2 na 1,4.

Podiel preto nerastie vernosťou, ale počtom kupujúcich. Malá značka nedobehne veľkú tým, že bude stavať na vernosti. Rastie, keď osloví všetkých, ktorí kategóriu kupujú, nielen svojich zákazníkov.

Video je zjednodušený model NBD-Dirichlet (Goodhardt, Ehrenberg, Chatfield, 1984). Skutoční zákazníci sa líšia aj tým, ktoré značky majú radšej, vzorec však ostáva rovnaký: veľký rozdiel v počte kupujúcich, malý vo vernosti.

fameworks.sk/manifest
