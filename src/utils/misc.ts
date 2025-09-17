export const intParseHandler = (value: number | string) => {
    if (!value) {
        return 0;
    }
    return parseFloat(value as string);
}