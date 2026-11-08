// De pagina van de besparingscalculator. Rekent in de browser; er wordt niets
// opgeslagen of verstuurd (geen cookies, geen opslag, geen verzoeken).
import { AANNAMES, bereken, INVOER } from "./besparing.js";
import { PRIJZEN } from "./prijzen.js";

const $ = (id) => document.getElementById(id);
const eur = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const getal = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });
const eenDecimaal = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });

// Invoer: elke schuif heeft een getalveld ernaast; het getalveld mag buiten het bereik van de schuif.
const VELDEN = ["contracten", "uitgaven", "uren", "uurtarief", "vestigingen", "gebruikers"];
const NAAR_INVOER = { contracten: "contracten", uitgaven: "uitgaven", uren: "urenPerMaand", uurtarief: "uurtarief", vestigingen: "vestigingen", gebruikers: "gebruikers" };
// Aannames in procenten op de pagina, als fractie in de berekening.
const PROCENT = ["prijsvoordeel", "overbodig", "tijdwinst", "bundelbaar", "bundelvoordeel"];

const waarde = (el, terugval) => {
  const n = Number(el.value);
  return Number.isFinite(n) && el.value !== "" ? Math.max(0, n) : terugval;
};

function zetAannames(a) {
  $("looptijdJaren").value = a.looptijdJaren;
  for (const k of PROCENT) $(k).value = String(Math.round(a[k] * 1000) / 10);
}

function leesInvoer() {
  const uit = {};
  for (const v of VELDEN) uit[NAAR_INVOER[v]] = waarde($(`${v}-getal`), INVOER[NAAR_INVOER[v]]);
  uit.vestigingen = Math.max(1, Math.round(uit.vestigingen));
  uit.gebruikers = Math.max(1, Math.round(uit.gebruikers));
  return uit;
}

function leesAannames() {
  const a = { looptijdJaren: waarde($("looptijdJaren"), AANNAMES.looptijdJaren) };
  for (const k of PROCENT) a[k] = waarde($(k), AANNAMES[k] * 100) / 100;
  return a;
}

function terugverdientijd(maanden) {
  if (maanden === null) return "–";
  if (maanden < 1) return "binnen 1 maand";
  if (maanden > 120) return "meer dan 10 jaar";
  return `${eenDecimaal.format(maanden)} maanden`;
}

const ONDERDELEN = [
  ["heronderhandelen", "Op tijd heronderhandelen of overstappen", "Je ziet elk beslismoment ruim van tevoren aankomen, ook als een contract stilzwijgend doorloopt."],
  ["opzeggen", "Overbodige contracten opzeggen", "Met alles op één plek vind je abonnementen en contracten die niemand meer gebruikt."],
  ["tijd", "Tijdwinst op administratie", "Geen zoektocht door mappen en mailboxen meer; termijnen worden voor je bewaakt."],
  ["bundelen", "Gebundeld inkopen", "Met al je vestigingen in beeld zie je welke contracten samen goedkoper kunnen."],
];

function toon() {
  const invoer = leesInvoer();
  const r = bereken(invoer, leesAannames(), PRIJZEN);
  const vanaf = PRIJZEN.concept ? "vanaf " : "";

  $("uitgaven-tekst").textContent = eur.format(invoer.uitgaven) + " per jaar";
  $("uurtarief-tekst").textContent = eur.format(invoer.uurtarief) + " per uur";

  $("netto").textContent = eur.format(Math.round(r.netto));
  $("netto").classList.toggle("negatief", r.netto < 0);
  $("terug").textContent = terugverdientijd(r.terugverdientijd);
  $("totaal").textContent = `Besparing ${eur.format(Math.round(r.besparing))} per jaar, min de kosten van ${vanaf}${eur.format(r.kosten)} per jaar.`;

  const max = Math.max(...Object.values(r.onderdelen), 1);
  $("staven").replaceChildren(
    ...ONDERDELEN.filter(([k]) => k !== "bundelen" || invoer.vestigingen >= PRIJZEN.groep.vanafVestigingen).map(([k, naam, uitleg]) => {
      const rij = document.createElement("div");
      rij.className = "staaf-rij";
      const kop = document.createElement("div");
      kop.className = "staaf-kop";
      const a = document.createElement("span");
      a.textContent = naam;
      const b = document.createElement("span");
      b.textContent = eur.format(Math.round(r.onderdelen[k]));
      kop.append(a, b);
      const staaf = document.createElement("div");
      staaf.className = "staaf";
      const vul = document.createElement("i");
      vul.style.width = `${((r.onderdelen[k] / max) * 100).toFixed(1)}%`;
      staaf.append(vul);
      const noot = document.createElement("p");
      noot.className = "hint";
      noot.textContent = uitleg;
      rij.append(kop, staaf, noot);
      return rij;
    }),
  );

  $("pakket").textContent = `Pakket ${r.pakket.naam}`;
  $("kosten").textContent = `${vanaf}${eur.format(r.pakket.perMaand)} per maand`;
  const t = r.pakket.toelichting;
  $("pakket-uitleg").textContent =
    r.pakket.naam === PRIJZEN.groep.naam
      ? `${getal.format(t.vestigingen)} vestigingen × ${eur.format(t.perVestiging)} plus de groepsmodule (${eur.format(t.groepsmodule)}), per maand, excl. btw.`
      : r.pakket.naam === PRIJZEN.business.naam
        ? `${getal.format(t.gebruikers)} gebruikers × ${eur.format(PRIJZEN.business.perGebruiker)} per maand (minimaal ${PRIJZEN.business.minimumGebruikers}), excl. btw.`
        : `${t.extraGebruikers > 0 ? `Inclusief ${t.extraGebruikers} extra ${t.extraGebruikers === 1 ? "gebruiker" : "gebruikers"}. ` : ""}Excl. btw.${PRIJZEN.concept ? " Het prijsmodel is nog niet definitief." : ""}`;

  // De uitkomst in de onderwerpregel van de demo-mail; er wordt verder niets verstuurd.
  const onderwerp = `Demo SCM-contractmanagement – indicatie ${eur.format(Math.round(r.netto))} per jaar`;
  for (const a of document.querySelectorAll("[data-demo]")) a.href = `mailto:info@supplychainmeneer.nl?subject=${encodeURIComponent(onderwerp)}`;
}

for (const v of VELDEN) {
  const schuif = $(v);
  const veld = $(`${v}-getal`);
  veld.value = schuif.value;
  schuif.addEventListener("input", () => {
    veld.value = schuif.value;
    toon();
  });
  veld.addEventListener("input", () => {
    if (veld.value !== "") schuif.value = String(Math.min(Number(schuif.max), Math.max(Number(schuif.min), Number(veld.value))));
    toon();
  });
}
for (const k of ["looptijdJaren", ...PROCENT]) $(k).addEventListener("input", toon);
$("standaard").addEventListener("click", () => {
  zetAannames(AANNAMES);
  toon();
});

zetAannames(AANNAMES);
toon();
