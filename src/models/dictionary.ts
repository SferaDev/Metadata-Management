import _ from "lodash";
// @ts-ignore FIXME
import mdTable from "markdown-table";

import { getAllReferences, getExpression, getMetadata, uidRegEx } from "../utils/metadata";
import { D2, MetadataPackage } from "../types/d2";

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

        const dependencies = _(getAllReferences(d2, element, model))
            .values()
            .flattenDeep()
            .uniq()
            .value();
        const possibleReferences = JSON.stringify(element).match(uidRegEx);
        // @ts-ignore FIXME
        const references = await getMetadata(d2, [...dependencies, ...possibleReferences]);

        // @ts-ignore FIXME
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

    public async generateMarkdown(d2: D2): Promise<string> {
        const markdown: string[] = [];

        markdown.push(...this.buildTitle());

        markdown.push(...this.buildDescription());

        markdown.push(...(await this.buildSpecificPart(d2)));

        return _.join(markdown, "\n\n");
    }
}
