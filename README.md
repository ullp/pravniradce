# Právní rádce – soběstačná statická databázová aplikace

Tento repozitář obsahuje statickou HTML aplikaci **Právní rádce** pro správu klientů a jejich právních případů. Je navržená tak, aby fungovala zdarma na GitHub Pages bez serveru.

## Aktuální struktura

```text
.
├─ index.html                  # hlavní statická aplikace
├─ data/
│  ├─ database.json            # primární databáze aplikace
├─ templates/
│  └─ popis-stiznosti-template.md
├─ .github/workflows/pages.yml # nasazení na GitHub Pages
├─ .nojekyll
└─ README.md
```

Původní zdrojová složka `0-data/` byla převedena do databáze a odstraněna z repozitáře. Aplikace proto není závislá na archivních PDF, Pages, DOCX, obrázcích ani starých exportech.

## Datový model

Aplikace načítá primárně:

```text
data/database.json
```

Databáze obsahuje:

- klienta **Petr Ullmann**,
- agendy pod klientem:
  - **SVJ**,
  - **Eva**,
- jednotlivé případy v agendách,
- právní otázky, nároky, chybějící podklady,
- metadata původních příloh,
- převedené textové zdroje z původních `.md`, `.txt` a `.csv` souborů,
- inventář odstraněných zdrojových souborů.

Levé menu má strukturu:

```text
Klienti
└─ Petr Ullmann
   ├─ SVJ
   │  ├─ Souhrnné stížnosti a přestupky SVJ
   │  ├─ Balkony
   │  ├─ Energie
   │  └─ ...
   └─ Eva
```

Kliknutí na agendu **SVJ** nebo **Eva** zobrazí časovou osu a výpis jednotlivých případů. Kliknutí na konkrétní případ zobrazí detail případu.

## Ukládání změn

Aplikace běží jako statický web. Lokální změny provedené v prohlížeči se ukládají do `localStorage` pod klíčem:

```text
pravni_radce_database_v2
```

To umožňuje bezplatný provoz na GitHub Pages. Sdílený zápis mezi více uživateli by vyžadoval doplnění serveru nebo zápis přes GitHub Contents API.

## Spuštění lokálně

```bash
python3 -m http.server 8080
```

Potom otevřete:

```text
http://localhost:8080/
```

## GitHub Pages

Workflow `.github/workflows/pages.yml` publikuje celý repozitář jako statický web. Pro běh aplikace stačí `index.html`, `data/database.json` a volitelná složka `templates/`.

## Přihlášení

Přihlášení je pouze lokální UI ochrana v prohlížeči. Používá session klíče:

```text
pravni_pripady_login_session_v2
pravni_pripady_role_v2
```

Nejde o serverovou autentizaci. Veřejný GitHub repozitář ani GitHub Pages nepoužívejte pro citlivá neveřejná data bez dodatečné ochrany.
