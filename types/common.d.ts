type history = {
  transactionId: string;
  productId: number | bigint;
  name: string;
  qty: number;
  price: Decimal | number | null;
  date: Date;
  direction: string;
  description: string | null;
  updatedBy: string?;
};

type StockOpname = {
  stock: ProductStock;
  history: history[];
};

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};
