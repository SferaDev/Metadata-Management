import { getExpression } from "../../utils/metadata";
import { D2 } from "../../types/d2";

export async function indicatorSpecific(d2: D2, element: any): Promise<string[]> {
    return [
        `## Formulas`,

        `### Numerator`,
        `**Description:** ${element.numeratorDescription}`,
        `**Formula:** ${await getExpression(d2, element.numerator)}`,

        `### Denominator`,
        `**Description:** ${element.denominatorDescription}`,
        `**Formula:** ${await getExpression(d2, element.denominator)}`,
    ];
}
