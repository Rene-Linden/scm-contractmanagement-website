// De prijzen komen uit de app (bouwopdracht 17-11-2026, onderdeel E): de
// platformbeheerder legt ze daar vast, met per onderdeel het vinkje "tonen op
// de website". Hier staat geen enkel bedrag meer; prijzen.js is vervallen.
// Alleen de opbouw van de pakketten (grenzen, inbegrepen gebruikers) staat hier.

/** De app die de prijzen levert. TODO bij de productieomgeving: het adres van productie. */
export const APP_URL = "https://test.scm-contractmanagement.nl";
export const PRIJSLIJST_URL = `${APP_URL}/api/publiek/prijslijst`;

/**
 * De opbouw van de pakketten voor de calculator, met per prijs de sleutel van
 * het prijsonderdeel in de app. Geen bedragen.
 */
export const MODEL = {
  // Zolang dit aan staat, tonen de kosten als "vanaf" en "nog niet definitief".
  concept: true,
  pakketten: [
    { naam: "Basis", sleutel: "pakket_basis", maxContracten: 50, inbegrepenGebruikers: 3 },
    { naam: "Plus", sleutel: "pakket_plus", maxContracten: 200, inbegrepenGebruikers: 10 },
  ],
  extraGebruiker: "extra_gebruiker",
  // Business: per betalende gebruiker, minimaal 10 (prijsmodel 8-11, bevestigd 18-11-2026). Enterprise is op aanvraag en staat niet in de calculator.
  business: { naam: "Business", sleutel: "pakket_business", minimumGebruikers: 10 },
  // Vanaf zoveel vestigingen: een prijs per vestiging plus de groepsmodule.
  groep: { naam: "Groep", vanafVestigingen: 5, perVestiging: "franchise_per_vestiging", groepsmodule: "franchise_groepsmodule" },
};

/**
 * Zet het antwoord van de app om naar de prijzen van de calculator. Null als
 * een prijs ontbreekt: dan toont de calculator geen kosten (nooit een
 * verzonnen bedrag).
 */
export function prijzenUitApp(antwoord, model = MODEL) {
  const bedragen = new Map((antwoord?.prijzen ?? []).map((p) => [p.sleutel, p.bedrag]));
  const prijs = (sleutel) => (typeof bedragen.get(sleutel) === "number" ? bedragen.get(sleutel) : null);
  const extra = prijs(model.extraGebruiker);
  const pakketten = model.pakketten.map((p) => ({ naam: p.naam, maxContracten: p.maxContracten, inbegrepenGebruikers: p.inbegrepenGebruikers, perMaand: prijs(p.sleutel), extraGebruiker: extra }));
  const business = { naam: model.business.naam, perGebruiker: prijs(model.business.sleutel), minimumGebruikers: model.business.minimumGebruikers };
  const groep = { naam: model.groep.naam, vanafVestigingen: model.groep.vanafVestigingen, perVestiging: prijs(model.groep.perVestiging), groepsmodule: prijs(model.groep.groepsmodule) };
  const alle = [extra, business.perGebruiker, groep.perVestiging, groep.groepsmodule, ...pakketten.map((p) => p.perMaand)];
  if (alle.some((b) => b === null)) return null;
  return { concept: model.concept, pakketten, business, groep };
}

/** Haalt de prijzen op bij de app; null als dat niet lukt. Geen cookies, geen tracking. */
export async function laadPrijzen(ophalen = fetch) {
  try {
    const r = await ophalen(PRIJSLIJST_URL, { credentials: "omit", referrerPolicy: "no-referrer" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
