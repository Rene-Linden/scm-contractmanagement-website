// De berekening van de besparingscalculator, los van de pagina (bouwopdracht
// besparingscalculator, 8-11-2026). Rekent alleen; geen opslag, geen verzoeken.

/** Aannames (standaard). Op de pagina zichtbaar en aan te passen. */
export const AANNAMES = {
  looptijdJaren: 3,
  prijsvoordeel: 0.08,
  overbodig: 0.03,
  tijdwinst: 0.5,
  bundelbaar: 0.5,
  bundelvoordeel: 0.05,
};

/** Invoer van de bezoeker (standaard). */
export const INVOER = {
  contracten: 40,
  uitgaven: 150000,
  urenPerMaand: 8,
  uurtarief: 60,
  vestigingen: 1,
  gebruikers: 3,
};

/**
 * Het pakket en de kosten per maand. Bij 5 of meer vestigingen het
 * groepsmodel; anders het goedkoopste pakket dat bij het aantal contracten
 * past (Basis of Plus met extra gebruikers, of Business).
 */
export function kiesPakket(invoer, prijzen) {
  const { contracten, gebruikers, vestigingen } = invoer;
  const g = prijzen.groep;
  if (vestigingen >= g.vanafVestigingen) {
    return { naam: g.naam, perMaand: vestigingen * g.perVestiging + g.groepsmodule, toelichting: { vestigingen, perVestiging: g.perVestiging, groepsmodule: g.groepsmodule } };
  }
  const opties = prijzen.pakketten
    .filter((p) => contracten <= p.maxContracten)
    .map((p) => {
      const extra = Math.max(0, gebruikers - p.inbegrepenGebruikers);
      return { naam: p.naam, perMaand: p.perMaand + extra * p.extraGebruiker, toelichting: { extraGebruikers: extra } };
    });
  const b = prijzen.business;
  const betaald = Math.max(gebruikers, b.minimumGebruikers);
  opties.push({ naam: b.naam, perMaand: betaald * b.perGebruiker, toelichting: { gebruikers: betaald } });
  // Goedkoopste eerst; bij gelijke prijs het kleinste pakket (de volgorde hierboven).
  return opties.reduce((beste, o) => (o.perMaand < beste.perMaand ? o : beste));
}

/** De besparing per jaar, per onderdeel, en wat er netto overblijft. */
export function bereken(invoer = INVOER, aannames = AANNAMES, prijzen) {
  const a = aannames;
  const heronderhandelen = a.looptijdJaren > 0 ? (invoer.uitgaven / a.looptijdJaren) * a.prijsvoordeel : 0;
  const opzeggen = invoer.uitgaven * a.overbodig;
  const tijd = invoer.urenPerMaand * 12 * invoer.uurtarief * a.tijdwinst;
  const bundelen = invoer.vestigingen >= prijzen.groep.vanafVestigingen ? invoer.uitgaven * a.bundelbaar * a.bundelvoordeel : 0;
  const besparing = heronderhandelen + opzeggen + tijd + bundelen;
  const pakket = kiesPakket(invoer, prijzen);
  const kosten = pakket.perMaand * 12;
  return {
    onderdelen: { heronderhandelen, opzeggen, tijd, bundelen },
    besparing,
    pakket,
    kosten,
    netto: besparing - kosten,
    // In maanden; null als er niets te besparen valt.
    terugverdientijd: besparing > 0 ? kosten / (besparing / 12) : null,
  };
}
