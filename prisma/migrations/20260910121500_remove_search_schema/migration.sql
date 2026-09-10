-- Remove Search data structures from the host project; Search is installable through the module package.
DROP TABLE IF EXISTS `SearchSettings`;
DROP TABLE IF EXISTS `SearchConfiguration`;

ALTER TABLE `page` DROP COLUMN `searchText`;
ALTER TABLE `post` DROP COLUMN `searchText`;
