export type BundleProductOption = {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  currentPrice: number;
  currentStock: number;
};

export type ProductBundleItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    barcode: string | null;
    sku: string | null;
    stocks?: Array<{
      quantity: number;
      sellPrice: string | number;
      markupPercentage: number | null;
      discountPercentage: number | null;
    }>;
  };
};

export type ProductBundle = {
  id: string;
  productId: string;
  sellPrice: string | number;
  isActive: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    barcode: string | null;
    sku: string | null;
    categoryId: string;
    brandId: string;
    category: { id: string; name: string };
    brand: { id: string; name: string };
  };
  items: ProductBundleItem[];
};

export type ProductBundleListData = {
  contents: ProductBundle[];
  totalRow: number;
};
