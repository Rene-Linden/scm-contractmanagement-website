// Prijsmodel voor de besparingscalculator (concept, 8-11-2026). Alle prijzen per
// maand, exclusief btw. Hier aanpassen; de rest van de calculator leest ze uit.
// Zolang `concept` aan staat, toont de pagina de kosten als "vanaf".
export const PRIJZEN = {
  concept: true,
  pakketten: [
    { naam: "Basis", maxContracten: 50, inbegrepenGebruikers: 3, perMaand: 49, extraGebruiker: 9 },
    { naam: "Plus", maxContracten: 200, inbegrepenGebruikers: 10, perMaand: 99, extraGebruiker: 9 },
  ],
  business: { naam: "Business", perGebruiker: 15, minimumGebruikers: 10 },
  // Vanaf zoveel vestigingen: een prijs per vestiging plus de groepsmodule.
  groep: { naam: "Groep", vanafVestigingen: 5, perVestiging: 19, groepsmodule: 495 },
};
