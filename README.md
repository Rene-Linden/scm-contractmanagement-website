# SCM-contractmanagement – website

De publieke website op https://scm-contractmanagement.nl. Losse bestanden, geen build-stap. Elke push naar `main` staat na ongeveer een minuut online via GitHub Pages.

| Bestand | Wat |
|---|---|
| `index.html` | Homepage |
| `privacy.html`, `voorwaarden.html` | Juridische pagina's (tekst volgt) |
| `stijl.css` | Tokens en opmaak, redactionele variant van de stijlgids |
| `menu.js` | Uitschuifmenu op mobiel |
| `fonts/` | Inter en Fraunces, zelf gehost (SIL Open Font License) |
| `besparingscalculator.html` | Besparingscalculator, alleen via de directe link (zie hieronder) |
| `besparing.js`, `calculator.js` | De berekening (los te testen) en de pagina |
| `prijzen.js` | Prijsmodel van de calculator: hier de prijzen aanpassen |
| `tests/` | Unittests van de berekening: `node --test tests/*.test.mjs` |

Geen cookies, geen tracking en geen verzoeken naar andere domeinen.

## Besparingscalculator

Gebouwd 8-11-2026 volgens `website/bouwopdracht-besparingscalculator.md` (in de app-repo). Opbouw en werking volgen de klachtenkostencalculator van SCM-VAR (`SCM-VAR-Site/calculator.html`): invoer links, uitkomst rechts, staafjes per onderdeel, inklapbare aannames en een oproep tot een demo. Een calculator voor voorraadbeheer op de site van Supply Chain Meneer is niet gevonden.

- Rekent alleen in de browser: geen opslag, geen cookies, geen verzoeken. De uitkomst gaat alleen mee in de onderwerpregel als de bezoeker zelf op "Plan een demo" klikt.
- Pakketkeuze: bij 5 of meer vestigingen het groepsmodel; anders het goedkoopste pakket dat bij het aantal contracten past (Basis of Plus met extra gebruikers, of Business).
- Zolang `concept: true` in `prijzen.js` staat, tonen de kosten als "vanaf".
- Getest: unittests (standaardwaarden, 1, 5 en 100 vestigingen, grenzen van de pakketten); in Chrome op desktop en 360 px, met het toetsenbord; geen netwerkverzoeken bij het rekenen.

### Zichtbaar maken (na akkoord van René)

1. `besparingscalculator.html`: de regel `<meta name="robots" content="noindex, nofollow">` weghalen.
2. `sitemap.xml`: `<url><loc>https://scm-contractmanagement.nl/besparingscalculator</loc></url>` toevoegen.
3. `index.html`, in `.nav-links`: `<a href="besparingscalculator">Besparing berekenen</a>`.
4. `index.html`, blok op de homepage, bijvoorbeeld vóór `#prijzen`:

   ```html
   <section class="vlak-creme">
     <div class="sectie rand">
       <p class="label">Besparingscalculator</p>
       <h2 class="kop-ruimte">Wat levert het jou op?</h2>
       <p class="lede">Vul je eigen cijfers in en zie in een minuut wat contractbeheer je ongeveer oplevert.</p>
       <p class="knoppen"><a class="knop knop-primair" href="besparingscalculator">Bereken je besparing</a></p>
     </div>
   </section>
   ```
