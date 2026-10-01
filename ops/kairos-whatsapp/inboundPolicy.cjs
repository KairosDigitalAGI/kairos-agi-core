"use strict";

const EXPLICIT_COMMERCIAL_TYPES = Object.freeze(["prospecto", "site", "x1", "simulacao"]);

function isExplicitCommercialLead(lead) {
  if (!lead || typeof lead !== "object") return false;
  if (EXPLICIT_COMMERCIAL_TYPES.includes(lead.tipo)) return true;
  if (lead.meetingScheduled === true) return true;
  if (Array.isArray(lead.vendas) && lead.vendas.length > 0) return true;
  return false;
}

function shouldAutoReply({ databaseReady, lead, isFounder = false, isCoCeo = false } = {}) {
  if (isFounder || isCoCeo) return true;
  if (!databaseReady) return false;
  return isExplicitCommercialLead(lead);
}

module.exports = { EXPLICIT_COMMERCIAL_TYPES, isExplicitCommercialLead, shouldAutoReply };
