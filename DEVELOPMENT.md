# Vývoj nové verze

Tento adresář je nová pracovní kopie aplikace **Právní rádce** bez staré historie a bez původních zdrojových archivů ze `svj/0-data`.

## Lokální spuštění

```bash
cd /Users/ullp/git/pravniradce
python3 -m http.server 8080
```

Otevřít:

```text
http://localhost:8080/
```

## Hlavní soubory

- `index.html` – statická aplikace
- `data/database.json` – primární databáze
- `templates/` – šablony pro další vývoj
- `.github/workflows/pages.yml` – GitHub Pages deploy

## Validace

```bash
python3 -m json.tool data/database.json >/dev/null
python3 - <<'PY'
from pathlib import Path
s=Path('index.html').read_text()
start=s.find('<script>')+len('<script>')
end=s.find('</script>', start)
Path('/tmp/pravniradce-index-script.js').write_text(s[start:end])
PY
node --check /tmp/pravniradce-index-script.js
```
