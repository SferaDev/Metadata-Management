import _ from "lodash";

import { D2Model } from "./d2Model";
import { getAllReferences, getMetadata } from "../utils/metadata";
import { D2, MetadataPackage } from "../types/d2";
import { d2ModelFactory } from "./d2ModelFactory";

export default class Dictionary {
    private readonly model: string;
    private readonly element: any;
    private readonly dependencies: string[];
    private readonly references: MetadataPackage;

    constructor(model: string, element: any, dependencies: string[], references: MetadataPackage) {
        this.model = model;
        this.element = element;
        this.dependencies = dependencies;
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
        // @ts-ignore FIXME
        const references = await getMetadata(d2, dependencies);

        // @ts-ignore FIXME
        return new Dictionary(model, element, dependencies, references);
    }

    public generateMarkdown(d2: D2): string {
        const { element, model } = this;
        const markdown: string[] = [];

        // Title
        markdown.push(`# ${element.name}`);

        // Short name
        if (element.displayShortName) {
            markdown.push(`* **Short name:** ${element.displayShortName}`);
        } else if (element.shortName) {
            markdown.push(`* **Short name:** ${element.shortName}`);
        }

        // Description
        if (element.displayDescription) {
            markdown.push(`## Description`, `${element.displayDescription}`);
        } else if (element.description) {
            markdown.push(`## Description`, `${element.description}`);
        }

        switch (d2.models[model].name) {
            case "indicator":
                markdown.push(`## Formula`);
                markdown.push(`### Numerator`, `${element.numeratorDescription}`);
                markdown.push(`### Denominator`, `${element.denominatorDescription}`);
                break;
        }

        return _.join(markdown, "\n\n");
    }
}
