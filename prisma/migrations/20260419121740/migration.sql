/*
  Warnings:

  - You are about to drop the column `minGrosir` on the `product_stocks` table. All the data in the column will be lost.
  - You are about to drop the column `sellPriceGrosir` on the `product_stocks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product_stocks` DROP COLUMN `minGrosir`,
    DROP COLUMN `sellPriceGrosir`,
    ADD COLUMN `cogs` DECIMAL(10, 2) NOT NULL DEFAULT 0;
