export const formatCompactCurrency = (value: number) => {
  // Gunakan Intl.NumberFormat dengan opsi notation: "compact"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1, // Menampilkan 1 angka di belakang koma jika desimal (misal: Rp 1,5 jt)
  }).format(value);
};

export const formatCurrency = (num: number | undefined | null): string => {
  if (num === undefined || num === null) {
    num = 0;
  }

  let idr = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  return idr.format(num);
};

export const isEmptyVal = (value: any, includeZero?: boolean) => {
  if (
    value === "" ||
    value === undefined ||
    value === null ||
    (includeZero === true && value === 0)
  ) {
    return true;
  }

  return false;
};

export const sortByKey = (arr: Array<any>, key: string, sort: string) => {
  if (sort === "asc") {
    arr.sort(function (a, b) {
      return a[key] - b[key];
    });
  } else {
    arr.sort(function (a, b) {
      return b[key] - a[key];
    });
  }

  return arr;
};

export const roundNearest500 = (num: Number) => {
  return Math.round(Number(num) / 500) * 500;
};

export const getFinalPrice = (
  price: Number,
  markup: Number | null,
  discount: Number | null,
  rounded: boolean = false,
  formatted: boolean = false,
) => {
  if (markup === null) markup = 0;
  if (discount === null) discount = 0;

  let finalPrice =
    Number(price) * (1 + Number(markup) / 100) * (1 - Number(discount) / 100);

  if (rounded) {
    finalPrice = roundNearest500(finalPrice);
  }

  if (formatted) return formatCurrency(finalPrice);
  else return finalPrice;
};

export const dateUTC = (dateString: string) => {
  const date = new Date(dateString);

  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
};

export const calculateGrowth = (current: number, previous: number) => {
  const variance = current - previous;
  // Jika periode lalu 0 dan sekarang ada penjualan, dianggap tumbuh 100%. Jika dua-duanya 0, maka 0%.
  const percentage =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : Math.round((variance / previous) * 100 * 100) / 100; // Pembulatan 2 angka di belakang koma

  return {
    variance,
    percentage,
  };
};
