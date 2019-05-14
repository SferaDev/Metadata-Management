export function mdLink(text: string, url: string): string {
    return `[${text}](${url})`;
}

export function mdLinkId(id: string): string {
    return mdLink(id, `/#/metadata-dictionary/${id}`);
}
