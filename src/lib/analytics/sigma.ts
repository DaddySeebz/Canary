const sigmaLookup = [
  { sigma: 1, dpmo: 691462 },
  { sigma: 2, dpmo: 308538 },
  { sigma: 3, dpmo: 66807 },
  { sigma: 4, dpmo: 6210 },
  { sigma: 5, dpmo: 233 },
  { sigma: 6, dpmo: 3.4 },
];

export function calculateDpmo(violations: number, rows: number, rules: number) {
  if (rows <= 0 || rules <= 0) {
    return 0;
  }

  return (violations / (rows * rules)) * 1_000_000;
}

export function calculateSigmaLevel(dpmo: number) {
  if (dpmo <= sigmaLookup.at(-1)!.dpmo) {
    return 6;
  }

  if (dpmo >= sigmaLookup[0].dpmo) {
    return 1;
  }

  for (let index = 0; index < sigmaLookup.length - 1; index += 1) {
    const left = sigmaLookup[index];
    const right = sigmaLookup[index + 1];

    if (dpmo <= left.dpmo && dpmo >= right.dpmo) {
      const ratio = (left.dpmo - dpmo) / (left.dpmo - right.dpmo);
      return Number((left.sigma + ratio * (right.sigma - left.sigma)).toFixed(1));
    }
  }

  return 1;
}

export function getSigmaLabel(sigma: number) {
  if (sigma >= 6) return "World Class";
  if (sigma >= 5) return "Excellent";
  if (sigma >= 4) return "Good";
  if (sigma >= 3) return "Average";
  if (sigma >= 2) return "Below Average";
  return "Poor";
}

export function calculateYield(violations: number, rows: number, rules: number) {
  if (rows <= 0 || rules <= 0) {
    return 1;
  }

  return 1 - violations / (rows * rules);
}

export function getSigmaMetrics(violations: number, rows: number, rules: number) {
  const dpmo = calculateDpmo(violations, rows, rules);
  const sigma = calculateSigmaLevel(dpmo);
  const yieldValue = calculateYield(violations, rows, rules);

  return {
    dpmo,
    sigma,
    label: getSigmaLabel(sigma),
    yield: yieldValue,
    errorRate: rows > 0 && rules > 0 ? violations / (rows * rules) : 0,
  };
}
