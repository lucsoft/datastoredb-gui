export const compareArray = (allEntries: string[], requiredEntries: string[]) =>
    allEntries.filter((v) => requiredEntries.map(x => x.toLowerCase()).includes(v.toLowerCase())).length === requiredEntries.length;

export const compareArrayHalfMatch = (allEntries: string[], requiredEntries: string[]) =>
    allEntries.filter((v) => requiredEntries.map(x => x.toLowerCase()).includes(v.toLowerCase())).length >= requiredEntries.length / 2;

export const execludeCompareArray = (allEntries: string[], requiredEntries: string[]) =>
    allEntries.filter((v) => requiredEntries.map(x => x.toLowerCase()).includes(v.toLowerCase())).length == 0 ? true : false;