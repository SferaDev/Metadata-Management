export const mdLink = (text: string, url: string): string => `[${text}](${url})`;

export const mdLinkId = (id: string, text: string = id): string =>
    mdLink(text, `/#/metadata-dictionary/${id}`);
