-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `store_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `update_by` VARCHAR(191) NULL DEFAULT '',
    `is_sub_account` BOOLEAN NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `store_id` BIGINT NULL,
    `privileges` JSON NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provinces` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `province_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `cities_province_id_fkey`(`province_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `districts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `city_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `districts_city_id_fkey`(`city_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subdistricts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `distric_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `subdistricts_distric_id_fkey`(`distric_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `subdistrict_id` BIGINT NULL,
    `address` VARCHAR(191) NOT NULL,
    `address2` VARCHAR(191) NULL,
    `address3` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `stores_user_id_key`(`user_id`),
    UNIQUE INDEX `stores_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `img` VARCHAR(191) NULL,
    `store_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `img` VARCHAR(191) NULL,
    `store_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price_tag_label` VARCHAR(191) NULL DEFAULT '',
    `img` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `store_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `brand_id` BIGINT NOT NULL,
    `link_shopee` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `products_brand_id_fkey`(`brand_id`),
    INDEX `products_category_id_fkey`(`category_id`),
    INDEX `products_store_id_fkey`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outlets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sequence` INTEGER NULL,
    `store_id` BIGINT NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `is_active_pos` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `printExtraInfo` VARCHAR(191) NULL,
    `print_header_line1` VARCHAR(191) NULL,
    `print_header_line2` VARCHAR(191) NULL,
    `print_header_line3` VARCHAR(191) NULL,
    `print_header_line4` VARCHAR(191) NULL,
    `print_header_logo` VARCHAR(191) NULL,
    `print_header_line5` VARCHAR(191) NULL,

    INDEX `outlets_store_id_fkey`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `store_id` BIGINT NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `suppliers_store_id_fkey`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_stocks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `store_id` BIGINT NOT NULL,
    `outlet_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `sellPrice` DECIMAL(10, 2) NOT NULL,
    `sellPriceGrosir` DECIMAL(10, 2) NOT NULL,
    `minGrosir` INTEGER NOT NULL,
    `discount_percentage` INTEGER NULL,
    `markup_percentage` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',
    `marketplace_ids` JSON NULL,
    `marketplace_prices` JSON NULL,

    INDEX `product_stocks_outlet_id_fkey`(`outlet_id`),
    INDEX `product_stocks_product_id_fkey`(`product_id`),
    UNIQUE INDEX `product_stocks_store_id_product_id_outlet_id_key`(`store_id`, `product_id`, `outlet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `move_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `direction` ENUM('IN', 'OUT') NOT NULL,
    `store_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `move_type_store_id_fkey`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `move_date` DATE NOT NULL,
    `move_date_str` VARCHAR(191) NOT NULL DEFAULT '',
    `product_stock_id` BIGINT NOT NULL,
    `start_quantity` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `end_quantity` INTEGER NULL,
    `direction` ENUM('IN', 'OUT') NOT NULL,
    `move_type_id` BIGINT NOT NULL,
    `supplier_id` BIGINT NULL,
    `description` TEXT NULL,
    `cogs` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',
    `expired_date_str` VARCHAR(191) NULL DEFAULT '',
    `expired_date` DATETIME(3) NULL,
    `sold_out` BOOLEAN NULL,

    INDEX `idx_expired_date_sold_out`(`expired_date`, `sold_out`),
    INDEX `stock_movements_move_type_id_fkey`(`move_type_id`),
    INDEX `stock_movements_product_stock_id_fkey`(`product_stock_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `img` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outlet_payment_methods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `outlet_id` BIGINT NULL,
    `storeId` BIGINT NULL,
    `payment_method_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `outlet_payment_methods_payment_method_id_fkey`(`payment_method_id`),
    UNIQUE INDEX `outlet_payment_methods_storeId_outlet_id_payment_method_id_key`(`storeId`, `outlet_id`, `payment_method_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_outlets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `outlet_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `user_outlets_outlet_id_fkey`(`outlet_id`),
    INDEX `user_outlets_role_id_fkey`(`role_id`),
    INDEX `user_outlets_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shifts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `outlet_id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sort` INTEGER NOT NULL,
    `working_hours` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `shifts_outlet_id_fkey`(`outlet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_shifts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `shift_id` BIGINT NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `start_date_time` DATETIME(3) NOT NULL,
    `end_date_time` DATETIME(3) NULL,
    `capital` DECIMAL(10, 2) NULL,
    `cash_in_drawer` DECIMAL(10, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `user_shifts_shift_id_fkey`(`shift_id`),
    INDEX `user_shifts_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(25) NOT NULL,
    `outlet_id` BIGINT NOT NULL,
    `store_id` BIGINT NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `user_shift_id` BIGINT NOT NULL,
    `total_item` INTEGER NULL,
    `total_price` DECIMAL(10, 2) NULL,
    `total_discount` DECIMAL(10, 2) NULL,
    `amount_paid` DECIMAL(10, 2) NULL,
    `amount_change` DECIMAL(10, 2) NULL,
    `outlet_payment_method_id` BIGINT NOT NULL,
    `card_number` VARCHAR(191) NULL,
    `confirm_number` VARCHAR(191) NULL,
    `transaction_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',
    `marketplace` VARCHAR(191) NULL,
    `shipping_track_id` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `status` TINYINT NOT NULL DEFAULT 0,

    INDEX `transactions_outlet_id_fkey`(`outlet_id`),
    INDEX `transactions_outlet_payment_method_id_fkey`(`outlet_payment_method_id`),
    INDEX `transactions_user_id_fkey`(`user_id`),
    INDEX `transactions_user_shift_id_fkey`(`user_shift_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NOT NULL,
    `product_id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `category_id` BIGINT NOT NULL,
    `brand_id` BIGINT NOT NULL,
    `detail_category` ENUM('PRODUCT', 'DISCOUNT', 'DISCOUNT_VOUCHER', 'DISCOUNT_ADDITIONAL') NOT NULL DEFAULT 'PRODUCT',
    `qty` INTEGER NOT NULL,
    `sell_price` DECIMAL(10, 2) NOT NULL,
    `discount_percentage` INTEGER NULL,
    `markup_percentage` INTEGER NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `final_sell_price` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `total_discount` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',
    `product_stock_id` BIGINT NOT NULL,
    `note` TEXT NULL,

    INDEX `transaction_details_transaction_id_fkey`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devices` (
    `id` VARCHAR(191) NOT NULL,
    `device_id` VARCHAR(191) NOT NULL,
    `device_number` INTEGER NOT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `modelId` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',
    `store_id` BIGINT NOT NULL,
    `device_name` VARCHAR(191) NULL,
    `device_type` INTEGER NULL,
    `os_name` VARCHAR(191) NULL,
    `os_version` VARCHAR(191) NULL,
    `platform_api_level` INTEGER NULL,
    `model_name` VARCHAR(191) NULL,
    `outlet_id` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_edit_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `request_edit_transactions_transaction_id_code_key`(`transaction_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestTransaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `privileges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `path_pattern` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `districts` ADD CONSTRAINT `districts_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subdistricts` ADD CONSTRAINT `subdistricts_distric_id_fkey` FOREIGN KEY (`distric_id`) REFERENCES `districts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outlets` ADD CONSTRAINT `outlets_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `suppliers_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_stocks` ADD CONSTRAINT `product_stocks_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_stocks` ADD CONSTRAINT `product_stocks_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_stocks` ADD CONSTRAINT `product_stocks_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_move_type_id_fkey` FOREIGN KEY (`move_type_id`) REFERENCES `move_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_product_stock_id_fkey` FOREIGN KEY (`product_stock_id`) REFERENCES `product_stocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outlet_payment_methods` ADD CONSTRAINT `outlet_payment_methods_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_outlets` ADD CONSTRAINT `user_outlets_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_outlets` ADD CONSTRAINT `user_outlets_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_outlets` ADD CONSTRAINT `user_outlets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_shifts` ADD CONSTRAINT `user_shifts_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_shifts` ADD CONSTRAINT `user_shifts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_outlet_payment_method_id_fkey` FOREIGN KEY (`outlet_payment_method_id`) REFERENCES `outlet_payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_shift_id_fkey` FOREIGN KEY (`user_shift_id`) REFERENCES `user_shifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_details` ADD CONSTRAINT `transaction_details_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
