function calculateOneBiasTypePersonal(publication, biasType, headlines) {
  let biasExists = 0;
  let timesBiasTypeSeen = 0;
  let timesBiasTypeTrue = 0;

  for (let i = 0; i < headlines.length; i++) {
    if (headlines[i].publication === publication) {
      if (headlines[i].attribute1 === biasType && (headlines[i].attribute1Answer === "true" || headlines[i].attribute1Answer === "false")) {
        timesBiasTypeSeen++;
        biasExists = 1;
        if (headlines[i].attribute1Answer === "true") {
          timesBiasTypeTrue++;
        }
      } else if (headlines[i].attribute2 === biasType && (headlines[i].attribute2Answer === "true" || headlines[i].attribute2Answer === "false")) {
        timesBiasTypeSeen++;
        biasExists = 1;
        if (headlines[i].attribute2Answer === "true") {
          timesBiasTypeTrue++;
        }
      }
    }
  }
  const percentBiased = timesBiasTypeSeen > 0 ? Math.round((timesBiasTypeTrue / timesBiasTypeSeen) * 100) : 0;

  const bias = {
    biasExists: biasExists,
    percentBiased: percentBiased,
  };

  return bias;
}

module.exports = calculateOneBiasTypePersonal;
