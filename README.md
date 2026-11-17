# SmartClean – smartclean.si

Statična stran za **BSMART d.o.o.**, objavljena na GitHub Pages.

HTML se **ne ureja ročno**: vse strani zgradi generator `../_generator/zgradi2.py`
iz `../_generator/content.py`, zato bi ročne spremembe ob naslednji gradnji izginile.

```bash
cd ../_generator && python3 zgradi2.py
```

**Predogled:** v tej mapi poženi `python3 -m http.server 8000` in odpri `http://localhost:8000`
(povezave so absolutne, zato dvoklik na `index.html` ne deluje).

## Strani

```
index.html                    domača stran            →  /
panoge/index.html             pregled panog           →  /panoge/
panoge/{hoteli,gostinstvo,industrija,zdravstvo,facility}/index.html
o-nas/  faq/  zaposlitev/  kontakt/   (index.html)
404.html                      za vsak neobstoječ naslov (noindex)
sitemap.xml                   zgradi generator (lastmod = dan gradnje)
```

## Sredstva

```
assets/sc.css         oblikovni sistem (žetoni, svetla in temna tema, komponente)
assets/sc.js          vedenje: tema, glava, meni, razkrivanje, obrazci
assets/saten.js       WebGL saten — samo v uvodu domače strani
assets/fonts/*.woff2  Archivo + Playfair Display 700 (znamka), lokalno gostovano
assets/og.jpg         slika za deljenje (1200×630) — zgradi _generator/tools/og.mjs
favicon.ico, assets/favicon-32.png, assets/apple-touch-icon.png   monogram SC (isti kot portal)
robots.txt  CNAME  .nojekyll
```

Različica `?v=` je odtis CSS, JS in slike za deljenje, zato se ob vsaki spremembi zamenja sama.

## Obrazci

Kontakt in prijava za zaposlitev gresta prek **Web3Forms** (ključ je v `access_key`).
Ključ je živ: **ne pošiljaj testnih obrazcev.** Obrazca imata polje-past proti botom.

## Pravila vsebine

- Območje prevzema in dostave **ni** nikjer na strani (ne zemljevid, ne kraji, ne »vsa Slovenija«).
- Vsa dejstva izvirajo iz besedil stare strani; brez izmišljenih trditev, mnenj in števcev.
- Zelena barva samo v znamki; saten samo v uvodu domače strani.
