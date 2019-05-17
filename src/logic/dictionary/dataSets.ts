import _ from "lodash";
import mdTable from "markdown-table";
import { mdLinkId } from "../../utils/markdown";

export const buildRows = (dataElements: any, referenceMap: Map<string, any>): any =>
    dataElements.map(
        (e: any): any => {
            const optionSet = e.optionSet ? referenceMap.get(e.optionSet.id) : null;
            const options = optionSet
                ? optionSet.options.map((e: any): any => referenceMap.get(e.id))
                : [];
            const optionsText = options
                .slice(0, 15)
                .map((e: any): any => mdLinkId(e.id, e.name))
                .join("<br><br>");

            const categoryCombo = e.categoryCombo ? referenceMap.get(e.categoryCombo.id) : null;
            const categoryOptions = _.flatten(
                categoryCombo
                    ? categoryCombo.categories.map(
                          (e: any): any => {
                              const category = referenceMap.get(e.id);
                              return category.categoryOptions.map(
                                  (e: any): any => referenceMap.get(e.id)
                              );
                          }
                      )
                    : []
            );

            const categoryOptionsText = categoryOptions
                .slice(0, 15)
                .map((e: any): any => mdLinkId(e.id, e.name))
                .join("<br><br>");
            return [
                mdLinkId(e.id, e.name),
                e.shortName,
                e.description,
                e.valueType,
                optionsText,
                categoryOptionsText,
            ].map(
                (e): any => (typeof e === "string" ? e.replace(/(\r\n|\n|\r)/gm, "<br><br>") : e)
            );
        }
    );

export const dataSetSpecific = (references: any, referenceMap: Map<string, any>): string[] => {
    const markdown: string[] = [];
    markdown.push(`## Sections`);

    for (const section of references["sections"]) {
        markdown.push(
            `### Section: ${section.name}`,
            `Number of elements in Section: ${section.dataElements.length}`
        );

        const rows = section.dataElements.map((e: any): any => referenceMap.get(e.id));

        markdown.push(
            // @ts-ignore FIXME
            mdTable([
                ["Name", "Form Name", "Description", "Data Type", "Options", "Category Options"],
                ...buildRows(rows, referenceMap),
            ])
        );
    }

    return markdown;
};
