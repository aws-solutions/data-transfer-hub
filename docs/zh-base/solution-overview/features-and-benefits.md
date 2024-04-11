该解决方案的核心功能：

- 在AWS中国区域和AWS海外区域之间传输、跨云传输Amazon S3对象：在统一的平台上提供传输能力
- 自动缩放：快速响应文件传输中流量的变化
- 高性能的大文件传输（1TB）：利用集群、并行的大文件切片和自动重试的优势来实现稳健的文件传输
- 监控：跟踪数据流、诊断问题并确保数据传输过程的整体健康状况
- 开箱即用的部署

以上功能均受限于客户网络环境的可用性。

!!! note "注意"

    如果您需要在AWS区域之间传输Amazon S3对象，我们建议使用[跨区域复制][crr]。如果您想在同一AWS区域内传输Amazon S3对象，我们建议使用[同区域复制][srr]。

对于 AWS 中国区域和海外区域之间的数据传输，您应遵守适用于您的关于数据跨境传输的所有法律法规（包括采购有资质的运营商提供的合规跨境专线进行数据传输、履行必要的政府审批或备案），并自主启动数据的传输。AWS 并不协助您进行该等数据传输。

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[srr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#srr-scenario
