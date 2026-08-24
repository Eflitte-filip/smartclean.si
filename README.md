# SmartClean – smartclean.si

Statična stran, brez build koraka. Vsebino urejaš neposredno, commitaš in
GitHub Pages postreže.

**Predogled lokalno:** poženi v tej mapi `python3 -m http.server 8000` in
odpri `http://localhost:8000`. Dvoklik na `index.html` tudi deluje, samo
navigacija ne, ker so povezave absolutne (`/o-nas/`) – kar je pravilno za
živo stran.

```
index.html              domača stran            →  /
o-nas/index.html        O nas                   →  /o-nas/
panoge/index.html       Panoge                  →  /panoge/
faq/index.html          Pogosta vprašanja       →  /faq/
zaposlitev/index.html   Zaposlitev              →  /zaposlitev/
kontakt/index.html      Kontakt                 →  /kontakt/

assets/style.css        ves CSS
assets/app.js           ves JS
assets/og.png           slika za predoglede (1200×630)

robots.txt              dovoli indeksiranje, kaže na sitemap
sitemap.xml             6 URL-jev za Google Search Console
CNAME                   smartclean.si
```

Pomembno: mapa `assets/` mora biti commitana. Če stran v živo izgleda kot
gol besedilni dokument, je skoraj zagotovo ta mapa manjkala v pushu.

---

## Prenova videza – avgust 2026

Videz je v celoti prevzet po **portal.smartclean.si** (eflitte tokeni).
Struktura strani, besedila in SEO so nespremenjeni; zamenjan je oblikovni
sloj.

### Kaj se je spremenilo

**Barve.** Prej zelena/zlata/modra/koralna paleta. Zdaj monokromatsko,
enako kot portal: svetla tema `#ffffff` ozadje / `#0a0a0a` besedilo, temna
tema `#0a0a0a` ozadje / `#111112` kartice / bela pisava. Gumbi so črni z
belo pisavo (v temni temi obrnjeno – `--btn-ink`). Barvni poudarki so
odstranjeni; hierarhijo nosijo tipografija, 1px črte in prazen prostor.

Edini ostanek barve je logotip: `--wm-green` (`#1a6644` svetla,
`#6ed3a1` temna), točno tako kot ga uporablja portal.

**Pisave.** Identičen nabor in identičen Google Fonts URL kot portal:

```
Instrument Sans  400;500;600;700   – vse besedilo in vsi naslovi
Playfair Display 700;900           – samo logotip (wordmark)
Geist Mono       400;500;600       – številke korakov, značke, tabelarne št.
```

Prej: Playfair Display za naslove + DM Sans za besedilo. Naslovi so zdaj
Instrument Sans 700 z negativnim spacingom, kot na portalu.

**Geometrija.** `--radius:14px` (kartice), `9px` (polja, ikone, burger),
`100px` (gumbi, značke) – vse prevzeto iz `portal.css`.

**Kartice.** Brez senčnih dvigov (`translateY` + `box-shadow`). Zdaj 1px
obroba + rahla sprememba ozadja ob hoverju, enako kot vrstice v portalu.

**Ozadje.** Dodana animirana heksagonska mreža (`.sc-hex`) – isti SVG in
iste keyframe animacije kot na portalu. Vstavi jo `app.js` (`setupHexBg`),
da ni podvojena v šestih HTML datotekah. Izklopi se ob
`prefers-reduced-motion`.

**Temni pasovi.** Hero proces, števila, pristop, certifikati in noga
uporabljajo `--band`. V svetli temi je `#0a0a0a`, v temni `#141416` z 1px
mejo – da pas ostane viden tudi na temnem ozadju.

**Glava.** Burger prevzet s portala: 38×38 px, radij 9 px, črtice
16×1.5 px. Preklopnik teme 34×34 px, radij 9 px – identično portalu.

**Proces na domači strani.** Barvni prstan (moder/zelen/zlat po korakih) je
zamenjan z monokromatskim; barve so bile v `app.js`, ne v CSS.

**Ikona in theme-color.** Favicon je črn zaobljen kvadrat z „SC“, isti kot
na portalu. `theme-color` je zdaj dvojen (`#ffffff` / `#0a0a0a` glede na
sistemsko temo).

### Kaj je ostalo nespremenjeno

Vsa besedila, vseh 6 URL-jev, `<title>`, opisi, canonical, og/twitter meta,
JSON-LD, sitemap, robots, oba obrazca (web3forms + honeypot), preklopnik
teme in `localStorage` ključ `smartclean-theme`, dostopnost (skip link,
vidni fokus, `aria-*`).

### Preverjeno

- Vseh 6 strani × svetla/temna tema: brez JS napak, brez vodoravnega
  drsenja, tema se pravilno prebere iz `localStorage`.
- Mobilno (390×844): vseh 6 strani brez vodoravnega drsenja.
- CSS: uravnoteženi oklepaji, brez sklicev na odstranjene spremenljivke.

---

## Pospravljeno

- `smartclean-site/` je bila starejša kopija cele strani (brez povezave na
  portal v glavi in nogi). Premaknjena v `_to_delete/`.
- `_backup_pred_prenovo/` vsebuje 8 datotek, kot so bile pred prenovo.
- `_to_delete/` in `_backup_pred_prenovo/` **ne commitaj** – ju izbriši
  oz. dodaj v `.gitignore`.

## Za urediti

1. **Zdravstvo.** Kartica »Zdravstvo & sociala« obljublja bolnišnično
   perilo, medicinske uniforme in dokumentacijo za revizije. Če tega ne
   pokrivaš, jo je treba odstraniti enako kot farmacijo.
2. **Fotografije.** Stran še vedno nima nobene prave slike pralnice, ekipe
   ali perila. Za B2B zaupanje je to največja vrzel – nov, čist videz to
   še bolj izpostavi.
3. **Google Search Console** – dodaj domeno in oddaj `sitemap.xml`.
