// Mondphasen-Berechnung nach Jean Meeus, "Astronomical Algorithms", Kapitel 49.
// Genauigkeit: ca. 1-2 Minuten. Liefert UTC-Zeitpunkte von Neumond (phase=0) und Vollmond (phase=2).

function toRad(deg) { return deg * Math.PI / 180 }

// Julian Day aus Mondzyklus-Nummer k (k=0 entspricht Neumond am 2000-01-06)
// phase: 0=Neumond, 0.25=Erstes Viertel, 0.5=Vollmond, 0.75=Letztes Viertel
function meanPhaseJD(k) {
  const T = k / 1236.85
  return 2451550.09766
    + 29.530588861 * k
    + 0.00015437 * T * T
    - 0.000000150 * T * T * T
    + 0.00000000073 * T * T * T * T
}

// Korrekturen fuer praezise Phase-Zeit
function correctedPhaseJD(k, phase) {
  let jde = meanPhaseJD(k)
  const T = k / 1236.85
  const E = 1 - 0.002516 * T - 0.0000074 * T * T

  const M = toRad(2.5534 + 29.10535670 * k - 0.0000014 * T * T - 0.00000011 * T * T * T)
  const Mp = toRad(201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T - 0.000000058 * T * T * T * T)
  const F = toRad(160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T + 0.000000011 * T * T * T * T)
  const Omega = toRad(124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T)

  let corr = 0
  if (phase === 0) {
    // Neumond
    corr = -0.40720 * Math.sin(Mp)
         + 0.17241 * E * Math.sin(M)
         + 0.01608 * Math.sin(2 * Mp)
         + 0.01039 * Math.sin(2 * F)
         + 0.00739 * E * Math.sin(Mp - M)
         - 0.00514 * E * Math.sin(Mp + M)
         + 0.00208 * E * E * Math.sin(2 * M)
         - 0.00111 * Math.sin(Mp - 2 * F)
         - 0.00057 * Math.sin(Mp + 2 * F)
         + 0.00056 * E * Math.sin(2 * Mp + M)
         - 0.00042 * Math.sin(3 * Mp)
         + 0.00042 * E * Math.sin(M + 2 * F)
         + 0.00038 * E * Math.sin(M - 2 * F)
         - 0.00024 * E * Math.sin(2 * Mp - M)
         - 0.00017 * Math.sin(Omega)
         - 0.00007 * Math.sin(Mp + 2 * M)
  } else if (phase === 0.5) {
    // Vollmond — gleiche Korrekturen, leicht andere Koeffizienten
    corr = -0.40614 * Math.sin(Mp)
         + 0.17302 * E * Math.sin(M)
         + 0.01614 * Math.sin(2 * Mp)
         + 0.01043 * Math.sin(2 * F)
         + 0.00734 * E * Math.sin(Mp - M)
         - 0.00515 * E * Math.sin(Mp + M)
         + 0.00209 * E * E * Math.sin(2 * M)
         - 0.00111 * Math.sin(Mp - 2 * F)
         - 0.00057 * Math.sin(Mp + 2 * F)
         + 0.00056 * E * Math.sin(2 * Mp + M)
         - 0.00042 * Math.sin(3 * Mp)
         + 0.00042 * E * Math.sin(M + 2 * F)
         + 0.00038 * E * Math.sin(M - 2 * F)
         - 0.00024 * E * Math.sin(2 * Mp - M)
         - 0.00017 * Math.sin(Omega)
         - 0.00007 * Math.sin(Mp + 2 * M)
  }

  return jde + corr
}

function jdToDate(jd) {
  // Julian Day zu Javascript-Date (UTC)
  const unix = (jd - 2440587.5) * 86400000
  return new Date(unix)
}

export function moonPhasesBetween(fromDate, toDate) {
  const results = []
  const fromJd = (fromDate.getTime() / 86400000) + 2440587.5
  const toJd = (toDate.getTime() / 86400000) + 2440587.5

  // Finde Start-k (Mondzyklus-Nummer)
  const approxK = (fromJd - 2451550.09766) / 29.530588861
  let k = Math.floor(approxK) - 1

  while (true) {
    // Neumond bei k
    const newMoonJd = correctedPhaseJD(k, 0)
    // Vollmond bei k + 0.5 (nutzt k-Wert mit 0.5 Offset fuer die Formel)
    const fullMoonJd = correctedPhaseJD(k + 0.5, 0.5)

    if (newMoonJd >= fromJd && newMoonJd <= toJd) {
      results.push({ type: 'neumond', date: jdToDate(newMoonJd) })
    }
    if (fullMoonJd >= fromJd && fullMoonJd <= toJd) {
      results.push({ type: 'vollmond', date: jdToDate(fullMoonJd) })
    }

    if (newMoonJd > toJd && fullMoonJd > toJd) break
    k++
    if (k > approxK + 150) break // Sicherheit
  }

  // Nach Datum sortieren
  return results.sort((a, b) => a.date.getTime() - b.date.getTime())
}
