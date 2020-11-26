import React from "react";

const StepOneECRTips: React.FC = () => {
  return (
    <div className="tips">
      <div className="tips-title">Replication Engine for Amazon ECR</div>
      <div className="tips-desc">
        Amazon S3 engine is used for replicating Docker images from different
        Docker Registry.
      </div>
      <div className="tips-list">
        <ul>
          <li>
            <span>•</span>Replication between AWS standard partition and AWS CN
            paritition
          </li>
          <li>
            <span>•</span>Replication from Docker Hub, GCR.io, Quay.io
          </li>
          <li>
            <span>•</span>Replication from Azure, GCP, Alibaba Cloud, Tencent
            Cloud
          </li>
          <li>
            <span>•</span>Parralel replication
          </li>
          <li>
            <span>•</span>Support public Docker images and private Docker images
          </li>
          <li>
            <span>•</span>Support Selective Docker images
          </li>
          <li>
            <span>•</span>Serverless architect, no minimun cost
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneECRTips;
