const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const QUEUE_PATH = process.env.KAIROS_CRM_EVENTS_PATH || path.join(__dirname, "..", "data", "crm-events.jsonl");
const MAX_PENDING = 10000;

function leadSourceRef(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return crypto.createHash("sha256").update(digits).digest("hex");
}

function clean(value, max = 1200) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, max) : null;
}

function appendEvent({ phone, eventType, direction = "system", status = "applied", summary, metadata = {}, occurredAt }) {
  if (!phone || !eventType) return null;
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
  const event = {
    event_ref: crypto.randomUUID(),
    lead_source_ref: leadSourceRef(phone),
    event_type: eventType,
    direction,
    status,
    summary: clean(summary),
    metadata: metadata && typeof metadata === "object" ? metadata : {},
    occurred_at: occurredAt || new Date().toISOString(),
  };
  fs.appendFileSync(QUEUE_PATH, `${JSON.stringify(event)}\n`, { encoding: "utf8", mode: 0o600 });
  return event;
}

function pendingEvents(limit = 200) {
  return readEvents().slice(0, Math.min(limit, MAX_PENDING));
}

function acknowledgeEvents(ids) {
  if (!fs.existsSync(QUEUE_PATH) || !ids?.length) return 0;
  const accepted = new Set(ids.map(String));
  const events = readEvents();
  const kept = events.filter(event => !accepted.has(event.event_ref));
  if (kept.length === events.length) return 0;
  const temporary = `${QUEUE_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, kept.length ? `${kept.map(event => JSON.stringify(event)).join("\n")}\n` : "", { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporary, QUEUE_PATH);
  return events.length - kept.length;
}

function readEvents() {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  const lines = fs.readFileSync(QUEUE_PATH, "utf8").split("\n").filter(Boolean);
  try {
    const events = lines.map(line => JSON.parse(line));
    if (events.some(event => !event || typeof event.event_ref !== "string" || !event.event_ref.trim())) throw new Error("event_ref inválido");
    return events;
  } catch {
    throw new Error("Fila local de eventos ilegível; preservada para recuperação manual.");
  }
}

module.exports = { appendEvent, pendingEvents, acknowledgeEvents, leadSourceRef };

