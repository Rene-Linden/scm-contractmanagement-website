// Unittests voor de besparingscalculator: node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";

import { AANNAMES, bereken, INVOER, kiesPakket } from "../besparing.js";
import { PRIJZEN } from "../prijzen.js";

const rond = (x) => Math.round(x * 100) / 100;

test("standaardwaarden: de vier onderdelen, het pakket en de terugverdientijd", () => {
  const r = bereken(INVOER, AANNAMES, PRIJZEN);
  assert.deepEqual(r.onderdelen, { heronderhandelen: 4000, opzeggen: 4500, tijd: 2880, bundelen: 0 });
  assert.equal(r.besparing, 11380);
  // 40 contracten en 3 gebruikers passen in Basis (≤ 50 contracten, 3 gebruikers inbegrepen).
  assert.equal(r.pakket.naam, "Basis");
  assert.equal(r.kosten, 588);
  assert.equal(r.netto, 10792);
  assert.equal(rond(r.terugverdientijd), 0.62);
});

test("1 vestiging: geen bundelvoordeel; 100 vestigingen: groepsmodel en bundelvoordeel", () => {
  assert.equal(bereken({ ...INVOER, vestigingen: 4 }, AANNAMES, PRIJZEN).onderdelen.bundelen, 0);
  const groot = bereken({ ...INVOER, vestigingen: 100 }, AANNAMES, PRIJZEN);
  assert.equal(groot.onderdelen.bundelen, 150000 * 0.5 * 0.05);
  assert.equal(groot.pakket.naam, "Groep");
  assert.equal(groot.pakket.perMaand, 100 * 19 + 495);
  assert.equal(groot.kosten, (100 * 19 + 495) * 12);
  const vijf = bereken({ ...INVOER, vestigingen: 5 }, AANNAMES, PRIJZEN);
  assert.equal(vijf.pakket.perMaand, 5 * 19 + 495);
  assert.equal(vijf.onderdelen.bundelen, 3750);
});

test("grenzen van de pakketten: contracten, gebruikers en het goedkoopste pakket", () => {
  const pakket = (contracten, gebruikers) => kiesPakket({ contracten, gebruikers, vestigingen: 1 }, PRIJZEN);
  assert.deepEqual([pakket(50, 3).naam, pakket(50, 3).perMaand], ["Basis", 49]);
  assert.deepEqual([pakket(51, 3).naam, pakket(51, 3).perMaand], ["Plus", 99]);
  assert.deepEqual([pakket(200, 10).naam, pakket(200, 10).perMaand], ["Plus", 99]);
  // Meer dan 200 contracten: Business, minimaal 10 gebruikers.
  assert.deepEqual([pakket(201, 3).naam, pakket(201, 3).perMaand], ["Business", 150]);
  assert.deepEqual([pakket(201, 25).naam, pakket(201, 25).perMaand], ["Business", 375]);
  // Extra gebruikers € 9: bij 4 gebruikers Basis € 58.
  assert.equal(pakket(40, 4).perMaand, 58);
  // Tot 9 extra gebruikers blijft Basis goedkoper; daarna Plus (12 gebruikers: Basis € 130, Plus € 117).
  assert.deepEqual([pakket(40, 12).naam, pakket(40, 12).perMaand], ["Plus", 117]);
  // Veel gebruikers bij Plus: Business wordt goedkoper (30 gebruikers: Plus € 279, Business € 450 – dus Plus).
  assert.equal(pakket(150, 30).naam, "Plus");
});

test("zonder besparing geen terugverdientijd; een looptijd van 0 deelt niet door nul", () => {
  const leeg = bereken({ ...INVOER, uitgaven: 0, urenPerMaand: 0 }, AANNAMES, PRIJZEN);
  assert.equal(leeg.besparing, 0);
  assert.equal(leeg.terugverdientijd, null);
  assert.equal(leeg.netto, -588);
  assert.equal(bereken(INVOER, { ...AANNAMES, looptijdJaren: 0 }, PRIJZEN).onderdelen.heronderhandelen, 0);
});
