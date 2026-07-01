ALTER TABLE `transactions`
    ADD COLUMN `tracking_number` VARCHAR(191) NULL,
    ADD COLUMN `marketplace_reff_id` VARCHAR(191) NULL;
