import _ from "lodash";
import "../utils/lodash-mixins";
import mdTable from "markdown-table";
import i18n from "@dhis2/d2-i18n";

import {
    getAllReferences,
    getApiMetadata,
    getExpression,
    getMetadata,
    uidRegEx,
} from "../utils/metadata";
import { D2, MetadataPackage } from "../types/d2";
import { mdLinkId } from "../utils/markdown";
import { programSpecific } from "../logic/dictionary/programs";
import { indicatorSpecific } from "../logic/dictionary/indicators";
import { dataSetSpecific } from "../logic/dictionary/dataSets";

export default class Dictionary {
    private readonly model: string;
    private readonly element: any;
    private readonly references: MetadataPackage;
    private readonly referenceMap: Map<string, any>;

    constructor(
        model: string,
        element: any,
        references: MetadataPackage,
        referenceMap: Map<string, any>
    ) {
        this.model = model;
        this.element = element;
        this.references = references;
        this.referenceMap = referenceMap;
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

        const references = ["programs", "dataSets"].includes(model)
            ? await getApiMetadata(d2, model, element.id)
            : await getMetadata(d2, dependencies);

        const referenceMap = new Map(
            // @ts-ignore FIXME
            _(references)
                .values()
                .flattenDeep()
                .groupBy("id")
                .mapValues(_.head)
                .toPairs()
                .value()
        );

        return new Dictionary(model, element, references, referenceMap);
    }

    public async generateMarkdown(d2: D2): Promise<string> {
        const markdown: string[] = [];

        markdown.push(...this.buildTitle());

        markdown.push(...this.buildDescription());

        markdown.push(...(await this.buildSpecificPart(d2)));

        markdown.push(...(await this.buildReferences(d2)));

        return _.join(_.compact(markdown), "\n\n");
    }

    private buildTitle(): string[] {
        return [`# ${this.element.displayName || this.element.name || "Unnamed"}`];
    }

    private buildDescription(): string[] {
        const { element } = this;
        const markdown: string[] = [];

        markdown.push(`## Description`);
        markdown.push(element.displayShortName || element.shortName || null);
        markdown.push(element.displayDescription || element.description || null);

        return _.compact(markdown).length > 1 ? _.compact(markdown) : [];
    }

    private async buildSpecificPart(d2: D2): Promise<string[]> {
        const { element, model, references, referenceMap } = this;
        const markdown: string[] = [];

        console.log(model, element, references);

        switch (d2.models[model].name) {
            case "indicator":
                markdown.push(...(await indicatorSpecific(d2, element)));
                break;
            case "program":
                markdown.push(...programSpecific(references, referenceMap));
                break;
            case "dataSet":
                markdown.push(...dataSetSpecific(references, referenceMap));
                break;
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
            if (references.hasOwnProperty(key) && d2.models[key]) {
                const val = references[key];

                markdown.push(
                    `### ${d2.models[key].displayName || d2.models[key].name || "Unnamed"}`
                );

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
                    if (_.compact(details).length > 1)
                        table.push(
                            details.map(
                                (e): any => (e ? e.replace(/(\r\n|\n|\r)/gm, "<br><br>") : e)
                            )
                        );
                }

                // @ts-ignore FIXME
                const result = [..._.zip(ids, ...table)];

                // @ts-ignore FIXME
                markdown.push(mdTable(result));
            }
        }

        return markdown;
    }
}
