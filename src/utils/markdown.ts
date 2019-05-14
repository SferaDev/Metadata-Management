export function mdLink(text: string, url: string): string {
    return `[${text}](${url})`;
}

export function mdLinkId(id: string, text: string = id): string {
    return mdLink(text, `/#/metadata-dictionary/${id}`);
}
