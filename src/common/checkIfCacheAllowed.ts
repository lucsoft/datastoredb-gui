export const checkIfCacheIsAllowed = () => !matchMedia('not (list-style-type: "")').matches;