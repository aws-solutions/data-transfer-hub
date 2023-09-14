# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2023-09-15

### Added

- Added support for transferring ECR assets without tags #118
- Users can now list stopped tasks and clone tasks from the stopped ones #117

### Changed

- Enhanced transfer performance by utilizing cluster capabilities to transfer large files through multipart upload in parallel #116
- Added automatic restart functionality for the Worker CLI #109
- Enabled IMDSv2 by default for Auto Scaling Groups (ASG)
- Switched to using Launch Templates instead of Launch Configurations to launch ASG instances #115
- Automatically create a CloudFormation invalidation after the upgrade #52

## [2.4.0] - 2023-04-28

### Added

- Support for requester pay mode in S3 transfer task.

## [2.3.1] - 2023-04-18

### Fixed

- Fix deployment failure due to S3 ACL changes.

## [2.3.0] - 2023-03-30

### Added

- Support embedded dashboard and logs
- Support S3 Access Key Rotation
- Enhance One Time Transfer Task monitoring

## [1.0.1] - 2022-09-07

### Fixed

- Upgrade lambda runtime to python v3.7.0
- Fix the list limit of secrets

## [1.0.0] - 2021-12-22

### Added

- All files, initial version
