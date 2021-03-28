export const compareArray = (allEntries: string[], requiredEntries: string[]) =>
    allEntries.filter((v) => requiredEntries.includes(v)).length === requiredEntries.length;

export const execludeCompareArray = (allEntries: string[], requiredEntries: string[]) =>
    allEntries.filter((v) => requiredEntries.includes(v)).length == 0 ? true : false;