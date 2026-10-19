-- Keep the migration chain aligned with the schema already used by production.
ALTER TABLE `product_stocks`
    ADD COLUMN IF NOT EXISTS `sellPriceGrosir` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `minGrosir` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `stock_movements`
    MODIFY `expired_date` DATETIME(3) NULL;
