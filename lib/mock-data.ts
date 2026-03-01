// ── Data Model Types ─────────────────────────────────────────────────────────

export interface Consumer {
  id: string
  name: string
  unit: string
}

export interface Reading {
  consumerId: string
  value: number
  readingDate: string // ISO date
}

export interface ConsumptionPoint {
  month: string
  [consumerId: string]: number | string
}

// ── Mock Consumers ───────────────────────────────────────────────────────────

export const consumers: Consumer[] = [
  { id: "electricity", name: "Electricity", unit: "kWh" },
  { id: "gas", name: "Gas", unit: "m\u00B3" },
  { id: "water", name: "Water", unit: "m\u00B3" },
]

// ── Mock Readings (cumulative meter values) ──────────────────────────────────

export const readings: Reading[] = [
  // Electricity
  { consumerId: "electricity", value: 1000, readingDate: "2025-01-01" },
  { consumerId: "electricity", value: 1320, readingDate: "2025-02-01" },
  { consumerId: "electricity", value: 1590, readingDate: "2025-03-01" },
  { consumerId: "electricity", value: 1810, readingDate: "2025-04-01" },
  { consumerId: "electricity", value: 2000, readingDate: "2025-05-01" },
  { consumerId: "electricity", value: 2230, readingDate: "2025-06-01" },
  { consumerId: "electricity", value: 2520, readingDate: "2025-07-01" },
  { consumerId: "electricity", value: 2860, readingDate: "2025-08-01" },
  { consumerId: "electricity", value: 3100, readingDate: "2025-09-01" },
  { consumerId: "electricity", value: 3350, readingDate: "2025-10-01" },
  { consumerId: "electricity", value: 3640, readingDate: "2025-11-01" },
  { consumerId: "electricity", value: 3980, readingDate: "2025-12-01" },
  // Gas
  { consumerId: "gas", value: 500, readingDate: "2025-01-01" },
  { consumerId: "gas", value: 620, readingDate: "2025-02-01" },
  { consumerId: "gas", value: 710, readingDate: "2025-03-01" },
  { consumerId: "gas", value: 760, readingDate: "2025-04-01" },
  { consumerId: "gas", value: 790, readingDate: "2025-05-01" },
  { consumerId: "gas", value: 800, readingDate: "2025-06-01" },
  { consumerId: "gas", value: 805, readingDate: "2025-07-01" },
  { consumerId: "gas", value: 810, readingDate: "2025-08-01" },
  { consumerId: "gas", value: 830, readingDate: "2025-09-01" },
  { consumerId: "gas", value: 880, readingDate: "2025-10-01" },
  { consumerId: "gas", value: 960, readingDate: "2025-11-01" },
  { consumerId: "gas", value: 1080, readingDate: "2025-12-01" },
  // Water
  { consumerId: "water", value: 200, readingDate: "2025-01-01" },
  { consumerId: "water", value: 215, readingDate: "2025-02-01" },
  { consumerId: "water", value: 232, readingDate: "2025-03-01" },
  { consumerId: "water", value: 250, readingDate: "2025-04-01" },
  { consumerId: "water", value: 271, readingDate: "2025-05-01" },
  { consumerId: "water", value: 298, readingDate: "2025-06-01" },
  { consumerId: "water", value: 330, readingDate: "2025-07-01" },
  { consumerId: "water", value: 355, readingDate: "2025-08-01" },
  { consumerId: "water", value: 378, readingDate: "2025-09-01" },
  { consumerId: "water", value: 398, readingDate: "2025-10-01" },
  { consumerId: "water", value: 415, readingDate: "2025-11-01" },
  { consumerId: "water", value: 430, readingDate: "2025-12-01" },
]

// ── Compute Consumption (delta between consecutive readings) ─────────────────

export function computeConsumption(
  consumers: Consumer[],
  readings: Reading[],
): ConsumptionPoint[] {
  const grouped: Record<string, Reading[]> = {}

  for (const r of readings) {
    if (!grouped[r.consumerId]) grouped[r.consumerId] = []
    grouped[r.consumerId].push(r)
  }

  // Sort each group by date
  for (const key of Object.keys(grouped)) {
    grouped[key].sort(
      (a, b) =>
        new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime(),
    )
  }

  // Build a set of months from the first consumer (assumes all share the same months)
  const firstConsumer = consumers[0]
  const firstReadings = grouped[firstConsumer.id] ?? []
  const months: string[] = []

  for (let i = 1; i < firstReadings.length; i++) {
    const date = new Date(firstReadings[i].readingDate)
    months.push(
      date.toLocaleString("en-US", { month: "short", year: "2-digit" }),
    )
  }

  return months.map((month, idx) => {
    const point: ConsumptionPoint = { month }
    for (const consumer of consumers) {
      const consumerReadings = grouped[consumer.id]
      if (consumerReadings && consumerReadings[idx + 1]) {
        point[consumer.id] =
          consumerReadings[idx + 1].value - consumerReadings[idx].value
      }
    }
    return point
  })
}
