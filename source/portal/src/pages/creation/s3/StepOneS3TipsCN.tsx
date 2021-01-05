import React from "react";

const StepOneS3TipsCN: React.FC = () => {
  return (
    <div className="tips">
      <div className="tips-title">Amazon S3 复制引擎</div>
      <div className="tips-desc">
        使用Amazon S3引擎可以将其他云服务商中的数据复制至Amazon S3中.
      </div>
      <div className="tips-list">
        <ul>
          <li>
            <span>•</span>AWS标准区域和中国区的数据互相复制
          </li>
          <li>
            <span>•</span>从阿里云OSS复制到S3
          </li>
          <li>
            <span>•</span>从七牛云Kodo复制到S3
          </li>
          <li>
            <span>•</span>从腾讯云COS复制到S3
          </li>
          <li>
            <span>•</span>从Google GCS复制到S3
          </li>
          <li>
            <span>•</span>支持大文件传输
          </li>
          <li>
            <span>•</span>支持版本化
          </li>
          <li>
            <span>•</span>无服务架构，无最低消费
          </li>
          <li>
            <span>•</span>并行传输
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneS3TipsCN;
