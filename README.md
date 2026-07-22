# SmartClean – smartclean.si

Statična stran, brez build koraka. Vsebino datotek urejaš neposredno,
commitaš in GitHub Pages postreže.

**Predogled lokalno:** dvoklik na `index.html` deluje — CSS in JS se naložita
prek relativnih poti. Klik na navigacijo lokalno ne bo delal, ker so
povezave absolutne (`/o-nas/`), kar je pravilno za živo stran.
Če hočeš lokalno preizkusiti tudi navigacijo, poženi v tej mapi:

```
python3 -m http.server 8000
```

in odpri `http://localhost:8000`. Tam se obnaša točno kot v živo.

```
index.html              domača stran            →  /
o-nas/index.html        O nas                   →  /o-nas/
panoge/index.html       Panoge                  →  /panoge/
faq/index.html          Pogosta vprašanja       →  /faq/
zaposlitev/index.html   Zaposlitev              →  /zaposlitev/
kontakt/index.html      Kontakt                 →  /kontakt/

assets/style.css        ves CSS (prej inline)
assets/app.js           ves JS   (prej inline)
assets/og.png           slika za predoglede (1200×630)

robots.txt              dovoli indeksiranje, kaže na sitemap
sitemap.xml             6 URL-jev za Google Search Console
CNAME                   smartclean.si
.nojekyll               izklopi Jekyll na GitHub Pages
```

Pomembno: mapa `assets/` mora biti commitana. Če stran v živo izgleda kot
gol besedilni dokument brez oblikovanja, je skoraj zagotovo ta mapa
manjkala v pushu.

---

## Kaj se je spremenilo

### 1. Prijavnica za zaposlitev je delovala v prazno
Polja v `#applyForm` niso imela `name` atributov, zato je `FormData` pobral
samo skrita polja – vsaka prijava je prispela kot prazen mail.
Dodani `name`: `ime`, `email`, `telefon`, `delovno_mesto`, `sporocilo`,
`attachment`. Preverjeno, da odide vseh šest.

Oba obrazca imata zdaj tudi honeypot polje `botcheck` (web3forms ga
prepozna in tiho zavrže spam).

> **Priponke:** web3forms na brezplačnem planu CV-ja **ne** posreduje.
> Polje je pripravljeno, deluje pa šele na plačljivem planu.
> Do takrat je pošteno napisati »CV pošljite na info@…«.

### 2. Ena stran → šest pravih strani
Prej je bilo vse en URL; podstrani so živele v `<template>` elementih, ki
se ne renderirajo, zato jih Google sploh ni videl. Zdaj je vsaka stran
svoja datoteka s statusom 200, svojim `<title>`, opisom in `canonical`.
Back gumb, deep linki in deljenje povezav zdaj delujejo.

### 3. Glava strani
`og:*` in `twitter:*` (predogledi na LinkedInu, WhatsAppu, Slacku niso več
goli), `canonical`, favicon, `theme-color`, `robots`, in
`LaundryOrCleaningService` JSON-LD z naslovom, telefonom in območjem
delovanja.

### 4. Ikone
Vseh 31 emojijev zamenjanih z linijskimi SVG ikonami v istem slogu kot
sekcija »Naš proces«. Barve sledijo obstoječi paleti kartic.
Preverjeno s pregledom Unicode območij, ne z grepom – prvi poskus z grepom
je tiho odpovedal na znakih iz visoke ravnine (🧺, 📧, 📞, 📍) in jih je
devet ostalo.

### 5. Besedilo
»impresivno urejen miz« → »brezhibno urejeno mizo«, »nepogoljšano čisto«
→ »brezhibno čisto«, »pri vsaki naročilnici« → »pri vsakem naročilu«,
»talna obloga« → »talne obloge«, »Oblačila za čistilne sobe« → »za čiste
prostore«, »Visokotemp.« → »Visokotemperaturni«, © 2025 → 2026.

### 6. Dostopnost
Navigacija so pravi `<a href>` (prej `onclick` brez `href` – nedosegljivo
s tipkovnico in za crawlerje). Dodani vidni fokus, »Preskoči na vsebino«,
`aria-expanded` na hamburgerju, `aria-label` na ikonah in
`prefers-reduced-motion`.

### 7. Višina headerja
Poravnana z eflitte.si: `.nav-inner` je 75px, spodnja meja 1px → skupaj
76px (prej 68+1=69). Izmerjeno identično na namizju in mobilnem.
Logotip ostaja SmartClean wordmark, nespremenjen.
Dodan `scroll-padding-top:92px`, da sidrne povezave (`/#storitve`) ne
pristanejo pod fiksnim headerjem.

### 8. Burger gumb
Prevzet z eflitte.si: krog 46×46 px, obroba 1 px, tri črtice 11×1 px,
ob odprtju se zložijo v X (11,5×1,75 px). Geometrija je izmerjeno enaka.

### 9. Svetla in temna tema
Preklopnik je v glavi levo od gumba Kontakt – 34×34 px, radij 9 px,
sonce/luna, enako kot na eflitte.si. Izbira se hrani v `localStorage`
pod ključem `smartclean-theme`, privzeto svetla.

V `<head>` je majhen skript, ki temo nastavi **pred** izrisom, sicer bi
ob vsakem nalaganju za trenutek blisnila svetla tema.

Kako je narejeno: nekatere spremenljivke so nosile dva pomena hkrati –
`--dark` je bila hkrati barva besedila in ozadje temnih pasov, `--white`
hkrati ozadje kartic in barva pisave na temnih pasovih. Zato so razcepljene:

```
--ink       barva besedila        (prej --dark)
--surface   ozadje kartic/sekcij  (prej --white)
--green-t   zelena za besedilo    (prej --green)
--brand-rgb kanal za vse rgba obrobe
```

Svetla tema ima za nove spremenljivke natanko stare vrednosti, zato je
vizualno nespremenjena. Temna tema je samo drug nabor vrednosti v
`:root[data-theme="dark"]` – nobena komponenta zanjo ne ve.

Zelena za polnila (`--green`) v temni temi ni posvetljena, ker mora bela
pisava na njej ostati berljiva: `#1f7a51` da 5,3:1. Za besedilo in ikone
skrbi ločena, svetlejša `--green-t` (`#6ed3a1`).

Preverjeno: v obeh temah na vseh šestih straneh ni besedila pod 4,5:1 in
v temni temi ni nobene svetle ploskve, ki bi ostala neprebarvana.

---

## Potrjeno 22. 7. 2026

- **Naslov** Škalska cesta 6, Slovenske Konjice — potrjen, ostaja
- **50+ partnerjev** namesto 100+ (na treh mestih: hero, števec, O nas)
- **Sterilne sobe in čisti prostori odstranjeni.** Šla je storitvena
  kartica na domači strani, cela kartica »Farmacija & mikroelektronika«
  na Panogah skupaj z GMP/ISO, ter omembe v hero seznamu, podnaslovu
  storitev, uvodu Panog in odgovoru na FAQ. Storitev je zdaj pet,
  panog pet.

## Za urediti

1. **Zdravstvo.** Kartica »Zdravstvo & sociala« obljublja bolnišnično
   perilo, medicinske uniforme in dokumentacijo za revizije. Ta ostaja —
   če je ne pokrivaš, jo je treba odstraniti enako kot farmacijo.
2. **Fotografije.** Stran še vedno nima nobene prave slike pralnice,
   ekipe ali perila. Za B2B zaupanje je to trenutno največja vrzel.
3. **Google Search Console** – dodaj domeno in oddaj `sitemap.xml`.
