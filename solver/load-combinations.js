export function lambdaForUsage(usage) {
  return ["storage", "storage facility", "storage facilities"].includes(String(usage).trim().toLowerCase()) ? 0.6 : 0.3;
}
const pm = (base, term) => [base - term, base + term].sort((a, b) => a - b);
const nestedPm = (base, a, b) => [-1, 1].flatMap((sa) => [-1, 1].map((sb) => base + sa * a + sb * b)).sort((x, y) => x - y);

export function generateLoadCombinations(inputs) {
  const DL = Number(inputs.DL); const LL = Number(inputs.LL); const Ex = Number(inputs.Ex); const Ey = Number(inputs.Ey);
  const E = Number(inputs.EParallel ?? inputs.E_parallel ?? Ex); const Z = Number(inputs.Z); const Sso = Number(inputs.Sso ?? 0);
  const lambda = Number(inputs.lambda ?? lambdaForUsage(inputs.usage ?? "other"));
  const additionalType = String(inputs.additionalLoadType ?? inputs.additional_load_type ?? "").toLowerCase();
  const SLsm = additionalType === "snow" ? 1.2 * Sso : Number(inputs.SLSM ?? inputs.S_LSM ?? 0);
  const SWsm = additionalType === "snow" ? Sso : Number(inputs.SWSM ?? inputs.S_WSM ?? 0);
  const verticalCoefficient = 1.1 + 2 * Z / 3;
  return {
    lsmParallel: {
      "1.2DL + 1.5LL": 1.2 * DL + 1.5 * LL,
      "1.2DL + 0.5LL + S": 1.2 * DL + 0.5 * LL + SLsm,
      "DL + λLL ± E": pm(DL + lambda * LL, E),
      "0.9DL ± E": pm(0.9 * DL, E),
    },
    lsmNonparallel: {
      "DL + λLL ± Ex ± 0.3Ey": nestedPm(DL + lambda * LL, Ex, 0.3 * Ey),
      "DL + λLL ± Ey ± 0.3Ex": nestedPm(DL + lambda * LL, Ey, 0.3 * Ex),
      "0.9DL ± Ex ± 0.3Ey": nestedPm(0.9 * DL, Ex, 0.3 * Ey),
      "0.9DL ± Ey ± 0.3Ex": nestedPm(0.9 * DL, Ey, 0.3 * Ex),
    },
    verticalSeismic: {
      coefficientOnDL: verticalCoefficient,
      combinationPlusMinusE: pm(verticalCoefficient * DL + lambda * LL, E),
    },
    workingStress: {
      "DL + LL": DL + LL,
      "DL + LL + S": DL + LL + SWsm,
      "DL + λLL ± 0.7E": pm(DL + lambda * LL, 0.7 * E),
      "0.7DL ± 0.7E": pm(0.7 * DL, 0.7 * E),
    },
  };
}
