export function globalScaleFactor(designBaseShear, minimumDynamicBaseShear) {
  if (!(Number(minimumDynamicBaseShear) > 0)) throw new Error("minimumDynamicBaseShear must be positive");
  return Number(designBaseShear) / Number(minimumDynamicBaseShear);
}
export function scaleResponse(response, factor) {
  return Object.fromEntries(Object.entries(response).map(([key, value]) => [key, Number(value) * Number(factor)]));
}
export function srss(components) {
  return Math.sqrt([...components].reduce((sum, value) => sum + Number(value) ** 2, 0));
}
export function principalDirectionScaling(inputs) {
  const factor = globalScaleFactor(inputs.designBaseShearKips ?? inputs.design_base_shear_kips, inputs.minimumDynamicBaseShearKips ?? inputs.minimum_dynamic_base_shear_kips);
  return {
    scaleFactor: factor,
    scaledMajor: scaleResponse(inputs.unscaledMajor ?? inputs.unscaled_major, factor),
    scaledMinor: scaleResponse(inputs.unscaledMinor ?? inputs.unscaled_minor, factor),
  };
}
