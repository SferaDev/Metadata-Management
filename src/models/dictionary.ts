import _ from "lodash";
import mdTable from "markdown-table";
import i18n from "@dhis2/d2-i18n";

import { getAllReferences, getExpression, getMetadata, uidRegEx } from "../utils/metadata";
import { D2, MetadataPackage } from "../types/d2";
import { mdLinkId } from "../utils/markdown";

export default class Dictionary {
    private readonly model: string;
    private readonly element: any;
    private readonly references: MetadataPackage;

    constructor(model: string, element: any, references: MetadataPackage) {
        this.model = model;
        this.element = element;
        this.references = references;
    }

    public static async build(d2: D2, id: string): Promise<Dictionary | null> {
        const metadata = await getMetadata(d2, [id]);
        const model = _(metadata)
            .keys()
            .flattenDeep()
            .first();
        const element: any = _(metadata)
            .values()
            .flattenDeep()
            .first();
        if (!model || !element) return null;

        const possibleReferences = JSON.stringify(element).match(uidRegEx);
        const dependencies = _(getAllReferences(d2, element, model))
            .values()
            .flattenDeep()
            // @ts-ignore FIXME
            .union(possibleReferences)
            .uniq()
            .filter((e: string): boolean => e !== element.id)
            .value();

        const references = await getMetadata(d2, dependencies);
        if (references["users"]) delete references["users"];

        return new Dictionary(model, element, references);
    }

    private buildTitle(): string[] {
        return [`# ${this.element.name}`];
    }

    private buildDescription(): string[] {
        const { element } = this;
        const markdown: string[] = [];

        // Description title
        if (
            element.displayDescription ||
            element.description ||
            element.displayShortName ||
            element.shortName
        ) {
            markdown.push(`## Description`);
        }

        // Short name
        if (element.displayShortName) {
            markdown.push(`${element.displayShortName}`);
        } else if (element.shortName) {
            markdown.push(`${element.shortName}`);
        }

        // Description title
        if (element.displayDescription) {
            markdown.push(`${element.displayDescription}`);
        } else if (element.description) {
            markdown.push(`${element.description}`);
        }

        return markdown;
    }

    private async buildSpecificPart(d2: D2): Promise<string[]> {
        const { element, model } = this;
        const markdown: string[] = [];

        if (d2.models[model].name === "indicator") {
            markdown.push(
                `## Formulas`,

                `### Numerator`,
                `**Description:** ${element.numeratorDescription}`,
                `**Formula:** ${await getExpression(d2, element.numerator)}`,

                `### Denominator`,
                `**Description:** ${element.denominatorDescription}`,
                `**Formula:** ${await getExpression(d2, element.denominator)}`
            );
        }

        return markdown;
    }

    private async buildReferences(d2: D2): Promise<string[]> {
        const { references } = this;
        const markdown: string[] = [];

        markdown.push("## References");

        const properties = [
            {
                label: i18n.t("Name"),
                value: "name",
            },
            {
                label: i18n.t("Description"),
                value: "description",
            },
            {
                label: i18n.t("Expression"),
                value: "expression",
                expression: true,
            },
            {
                label: i18n.t("Filter"),
                value: "filter",
                expression: true,
            },
        ];

        for (const key in references) {
            if (references.hasOwnProperty(key)) {
                const val = references[key];

                markdown.push(`### ${d2.models[key].displayName}`);

                const ids = ["Identifier", ...val.map((e): string => mdLinkId(e.id))];

                const table = [];

                for (const prop of properties) {
                    const details = [prop.label];
                    for (const ref of val) {
                        const text =
                            prop.expression && ref[prop.value]
                                ? await getExpression(d2, ref[prop.value])
                                : ref[prop.value];
                        details.push(text ? text : ref[prop.value]);
                    }
                    if (_.compact(details).length > 1) table.push(details);
                }

                // @ts-ignore FIXME
                const result = [..._.zip(ids, ...table)];

                // @ts-ignore FIXME
                markdown.push(mdTable(result));
            }
        }

        return markdown;
    }

    public async generateMarkdown(d2: D2): Promise<string> {
        const markdown: string[] = [];

        markdown.push(...this.buildTitle());

        markdown.push(...this.buildDescription());

        markdown.push(...(await this.buildSpecificPart(d2)));

        markdown.push(...(await this.buildReferences(d2)));

        return _.join(markdown, "\n\n");
    }
}
