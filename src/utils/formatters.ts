
export const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const objectToCamelCase = <T extends object>(obj: T): any => {
  const entries = Object.entries(obj);
  const camelCaseEntries = entries.map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return [toCamelCase(key), objectToCamelCase(value)];
    }
    return [toCamelCase(key), value];
  });
  return Object.fromEntries(camelCaseEntries);
};

export const objectToSnakeCase = <T extends object>(obj: T): any => {
  const entries = Object.entries(obj);
  const snakeCaseEntries = entries.map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return [toSnakeCase(key), objectToSnakeCase(value)];
    }
    return [toSnakeCase(key), value];
  });
  return Object.fromEntries(snakeCaseEntries);
};
