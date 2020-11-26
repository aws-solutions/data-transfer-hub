import React from "react";

const StepOneECRTips: React.FC = () => {
  return (
    <div className="tips">
      <div className="tips-title">Replication Engine for Amazon ECR</div>
      <div className="tips-desc">
        Amazon ECR engine is used for replicating Docker images from different
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
            <span>•</span>Parallel replication
          </li>
          <li>
            <span>•</span>Support public Docker images
          </li>
          <li>
            <span>•</span>Support Selective Docker images
          </li>
          <li>
            <span>•</span>Serverless architect, no minimum cost
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneECRTips;
