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
            return [
                mdLinkId(e.id, e.name),
                e.shortName,
                e.description,
                e.valueType,
                optionsText,
            ].map(
                (e): any => (typeof e === "string" ? e.replace(/(\r\n|\n|\r)/gm, "<br><br>") : e)
            );
        }
    );

export const programSpecific = (references: any, referenceMap: Map<string, any>): string[] => {
    const markdown: string[] = [];
    markdown.push(`## Program Stages`);

    for (const programStage of references["programStages"]) {
        markdown.push(`### Stage: ${programStage.name}`, programStage.description);
        programStage.programStageSections.forEach(
            (programStageSectionId: any): any => {
                const programStageSection = referenceMap.get(programStageSectionId.id);
                markdown.push(
                    `#### Section: ${programStageSection.name}`,
                    `Number of elements in Section: ${programStageSection.dataElements.length}`
                );

                const rows = programStageSection.dataElements.map(
                    (e: any): any => referenceMap.get(e.id)
                );

                markdown.push(
                    // @ts-ignore FIXME
                    mdTable([
                        ["Name", "Form Name", "Description", "Data Type", "Options"],
                        ...buildRows(rows, referenceMap),
                    ])
                );
            }
        );

        if (programStage.programStageSections.length === 0) {
            const rows = programStage.programStageDataElements.map(
                (e: any): any => referenceMap.get(e.dataElement.id)
            );

            markdown.push(
                // @ts-ignore FIXME
                mdTable([
                    ["Name", "Form Name", "Description", "Data Type", "Options"],
                    ...buildRows(rows, referenceMap),
                ])
            );
        }
    }
    return markdown;
};
