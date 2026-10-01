import test from "node:test";
import assert from "node:assert/strict";
import policy from "../ops/kairos-whatsapp/inboundPolicy.cjs";

const { isExplicitCommercialLead, shouldAutoReply } = policy;

test("KAIROS only auto-replies to explicitly commercial contacts", () => {
  assert.equal(isExplicitCommercialLead({ tipo: "prospecto", state: "abertura" }), true);
  assert.equal(isExplicitCommercialLead({ tipo: "site", state: "abertura" }), true);
  assert.equal(isExplicitCommercialLead({ tipo: "inbound", state: "interesse", history: [{}, {}] }), false);
  assert.equal(isExplicitCommercialLead({ tipo: "equipe", state: "abertura" }), false);
  assert.equal(isExplicitCommercialLead({ tipo: null, state: "fechamento", history: [{}, {}] }), false);
  assert.equal(isExplicitCommercialLead(null), false);
});

test("KAIROS fails closed while the CRM is unavailable", () => {
  assert.equal(shouldAutoReply({ databaseReady: false, lead: { tipo: "prospecto" } }), false);
  assert.equal(shouldAutoReply({ databaseReady: true, lead: { tipo: "prospecto" } }), true);
  assert.equal(shouldAutoReply({ databaseReady: true, lead: { tipo: "inbound" } }), false);
});

