// BigInt serialization helper
const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export const JSONStringify = (obj: any) => {
  return JSON.stringify(obj, bigIntReplacer);
};
