# SmartClean – smartclean.si

Statična stran za **BSMART d.o.o.** Brez build koraka: HTML urejaš neposredno,
commitaš in GitHub Pages postreže.

**Predogled lokalno:** v tej mapi poženi `python3 -m http.server 8000` in odpri
`http://localhost:8000`. Povezave so absolutne (`/panoge/`), zato dvoklik na
`index.html` ne bo pravilno navigiral — uporabi strežnik.

## Strani

```
index.html                    domača stran            →  /
panoge/index.html             pregled panog           →  /panoge/
panoge/hoteli/index.html      Hoteli & turizem        →  /panoge/hoteli/
panoge/gostinstvo/index.html  Restavracije            →  /panoge/gostinstvo/
panoge/industrija/index.html  Industrija              →  /panoge/industrija/
panoge/zdravstvo/index.html   Zdravstvo & sociala     →  /panoge/zdravstvo/
panoge/facility/index.html    Facility management     →  /panoge/facility/
o-nas/index.html              O nas                   →  /o-nas/
faq/index.html                Pogosta vprašanja       →  /faq/
zaposlitev/index.html         Zaposlitev              →  /zaposlitev/
kontakt/index.html            Kontakt                 →  /kontakt/
```

## Sredstva

```
assets/style.css      celoten oblikovni sistem (žetoni, komponente, teme)
assets/app.js         vse vedenje (boben, zavihki, FAQ, predal, obrazci, teme)
assets/fonts/*.woff2  lokalno gostovane pisave — NIČ klicev na Google Fonts
assets/og.png         slika za predoglede (1200×630)
assets/favicon.svg    ikona
robots.txt sitemap.xml CNAME .nojekyll
```

**Pomembno:** mapi `assets/` in `.nojekyll` morata biti commitani.
Brez `.nojekyll` GitHub Pages spusti mape, ki se začnejo z `_`.

## Oblikovni sistem

Vse barve so žetoni na `:root` v `style.css` (razdelek 2). Temna tema je
`:root[data-theme="dark"]`. Vsaka podstran panoge prepiše samo `--accent`,
`--accent-ink`, `--accent-soft` in `--accent-line` — s tem dobi svoj podpis,
ostali sistem pa ostane enak.

- **Pisave:** Instrument Serif (naslovi), Inter (besedilo), JetBrains Mono (oznake, podatki)
- **Kontrast:** vse kombinacije besedila prestanejo WCAG AA (4,5:1) v obeh temah
- **Gibanje:** vse animacije spoštujejo `prefers-reduced-motion`
- **Brez JS:** vsebina je vidna tudi, če se `app.js` ne naloži

Ob spremembi `style.css` ali `app.js` dvigni številko v `?v=` na povezavah v
`<head>` in pred `</body>` vseh strani, da obiskovalci ne dobijo starega
predpomnilnika.

## Obrazci

Kontaktni obrazec in prijava za zaposlitev gresta prek **Web3Forms**
(ključ je v `<input name="access_key">`). Brez zalednega strežnika.
Obrazec ima honeypot polje proti botom.

## Kaj je bilo prenovljeno (september 2026)

- Nova zasnova: lebdeč tekstil v glavi, interaktiven boben pralnega cikla,
  izbirnik panog, zemljevid pokritosti
- Pet novih podstrani panog — vsaka s svojo barvo in inventarjem
- Pisave gostovane lokalno (prej Google Fonts — hitreje in brez vprašanja GDPR)
- Temna tema na vseh straneh
- Mobilna navigacija (predal) — prej je na telefonu ni bilo
- JSON-LD: Organization, WebPage, BreadcrumbList, Service, FAQPage, JobPosting
- Star videz je shranjen v `_backup_2026-09-20_pred_rebuild/`
