CREATE TABLE IF NOT EXISTS `product_bundles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `sell_price` DECIMAL(12, 2) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL,
  `deleted_at` DATETIME(3) NULL,
  `updated_by` VARCHAR(191) NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_bundles_product_id_key` (`product_id`),
  KEY `product_bundles_store_id_idx` (`store_id`),
  CONSTRAINT `product_bundles_store_id_fkey`
    FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `product_bundles_product_id_fkey`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_bundle_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `product_bundle_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL,
  `deleted_at` DATETIME(3) NULL,
  `updated_by` VARCHAR(191) NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_bundle_items_bundle_product_key` (`product_bundle_id`, `product_id`),
  KEY `product_bundle_items_product_id_idx` (`product_id`),
  CONSTRAINT `product_bundle_items_bundle_id_fkey`
    FOREIGN KEY (`product_bundle_id`) REFERENCES `product_bundles` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `product_bundle_items_product_id_fkey`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
