# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2020-10-10
### Added
- All files, initial version
- Web Portal
- S3 Plugin, support S3, Aliyun OSS, Tecent COS, Qiniu Kodo

## [1.0.1] - 2020-11-30
### Added
- ECR Plugin, support ECR to ECR, Public to ECR replication

## [1.1.0] - 2020-12-09
### Added
- Support of Authing as the authentication provider

### Changed
- Generate two separate cloudformation templates (one for Cognito, one for OIDC)


## [1.2.0] - 2021-01-06
### Added
- Support of replication from Google GCS
- Support of S3 replication based on S3 events
- Support of choosing destination storage class

### Changed
- Align with latest S3 Plugin Cloudformation Template (v1.3.0) as of release date