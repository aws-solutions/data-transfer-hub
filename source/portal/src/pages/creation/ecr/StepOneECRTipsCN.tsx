import React from "react";

const StepOneS3Tips: React.FC = () => {
  return (
    <div className="tips">
      <div className="tips-title">Amazon ECR 复制引擎</div>
      <div className="tips-desc">
        Amazon S3 引擎用于从不同的Docker仓库复制Docker映像
      </div>
      <div className="tips-list">
        <ul>
          <li>
            <span>•</span>在AWS标准区和AWS中国区之间进行复制
          </li>
          <li>
            <span>•</span>从Docker Hub, GCR.io, Quay.io复制到ECR
          </li>
          <li>
            <span>•</span>从Azure, GCP, 阿里云, 腾讯云复制到ECR
          </li>
          <li>
            <span>•</span>并行复制
          </li>
          <li>
            <span>•</span>支持公共Docker镜像和私有Docker镜像
          </li>
          <li>
            <span>•</span>支持选择性Docker镜像复制
          </li>
          <li>
            <span>•</span>无服务器架构，无最低消费
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneS3Tips;
