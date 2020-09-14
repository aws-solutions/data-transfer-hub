import React from "react";

const StepOneS3Tips: React.FC = () => {
  return (
    <div className="tips">
      <div className="tips-title">Replication Engine for Amazon S3</div>
      <div className="tips-desc">
        Amazon S3 engine is used for replicating objects from different sources
        into S3 Buckets.{" "}
      </div>
      <div className="tips-list">
        <ul>
          <li>
            <span>•</span>Replication between AWS standard partition and AWS CN
            paritition
          </li>
          <li>
            <span>•</span>Replcation from Aliyun OSS
          </li>
          <li>
            <span>•</span>Large file support
          </li>
          <li>
            <span>•</span>Versioning support
          </li>
          <li>
            <span>•</span>Serverless architect, no minimun cost
          </li>
          <li>
            <span>•</span>Parralel replication{" "}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneS3Tips;
