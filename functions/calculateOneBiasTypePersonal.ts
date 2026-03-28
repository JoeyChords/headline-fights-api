export interface HeadlineEntry {
  publication: string;
  attribute1: string;
  attribute1Answer: string;
  attribute2: string;
  attribute2Answer: string;
}

export function calculateOneBiasTypePersonal(
  publication: string,
  biasType: string,
  headlines: HeadlineEntry[]
): { biasExists: 0 | 1; percentBiased: number } {
  let biasExists: 0 | 1 = 0;
  let timesBiasTypeSeen = 0;
  let timesBiasTypeTrue = 0;

  for (const headline of headlines) {
    if (headline.publication === publication) {
      if (headline.attribute1 === biasType && (headline.attribute1Answer === "true" || headline.attribute1Answer === "false")) {
        timesBiasTypeSeen++;
        biasExists = 1;
        if (headline.attribute1Answer === "true") {
          timesBiasTypeTrue++;
        }
      } else if (
        headline.attribute2 === biasType &&
        (headline.attribute2Answer === "true" || headline.attribute2Answer === "false")
      ) {
        timesBiasTypeSeen++;
        biasExists = 1;
        if (headline.attribute2Answer === "true") {
          timesBiasTypeTrue++;
        }
      }
    }
  }

  const percentBiased = timesBiasTypeSeen > 0 ? Math.round((timesBiasTypeTrue / timesBiasTypeSeen) * 100) : 0;

  return { biasExists, percentBiased };
}
