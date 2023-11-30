function calculateOneBiasTypePersonal(publication, biasType, headlines) {
  //   console.log(publication);
  //   console.log(headlines);

  let timesBiasTypeSeen = 0;
  let timesBiasTypeTrue = 0;

  for (let i = 0; i < headlines.length; i++) {
    if (headlines[i].publication === publication) {
      if (headlines[i].attribute1 === biasType) {
        timesBiasTypeSeen++;
        if (headlines[i].attribute1Answer === "true") {
          timesBiasTypeTrue++;
        }
      } else if (headlines[i].attribute2 === biasType) {
        timesBiasTypeSeen++;
        if (headlines[i].attribute2Answer === "true") {
          timesBiasTypeTrue++;
        }
      }
    }
  }
  let biasPercent = timesBiasTypeSeen > 0 ? Math.round((timesBiasTypeTrue / timesBiasTypeSeen) * 100) : 0;

  return biasPercent;
}

module.exports = calculateOneBiasTypePersonal;
