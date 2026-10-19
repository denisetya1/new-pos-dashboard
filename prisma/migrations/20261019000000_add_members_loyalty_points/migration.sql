-- CreateTable
CREATE TABLE `members` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `member_code` VARCHAR(50) NOT NULL,
    `store_id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(191) NULL,
    `birth_date` DATE NULL,
    `address` TEXT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `members_store_id_member_code_key`(`store_id`, `member_code`),
    INDEX `members_store_id_phone_idx`(`store_id`, `phone`),
    INDEX `members_store_id_is_active_name_idx`(`store_id`, `is_active`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_point_transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `member_id` BIGINT NOT NULL,
    `store_id` BIGINT NOT NULL,
    `outlet_id` BIGINT NULL,
    `type` VARCHAR(20) NOT NULL,
    `points` INTEGER NOT NULL,
    `balance_after` INTEGER NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `reference_type` VARCHAR(50) NULL,
    `reference_id` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(191) NULL DEFAULT '',

    INDEX `loyalty_points_member_id_created_at_idx`(`member_id`, `created_at`),
    INDEX `loyalty_points_store_id_created_at_idx`(`store_id`, `created_at`),
    INDEX `loyalty_points_outlet_id_idx`(`outlet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_point_transactions` ADD CONSTRAINT `loyalty_point_transactions_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_point_transactions` ADD CONSTRAINT `loyalty_point_transactions_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_point_transactions` ADD CONSTRAINT `loyalty_point_transactions_outlet_id_fkey` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
