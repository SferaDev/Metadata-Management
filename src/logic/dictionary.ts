export default class Dictionary {
    public static async build(id: string): Promise<string> {
        return `# ${id}`;
    }
}
