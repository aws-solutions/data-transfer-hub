import React from "react";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

interface LinkProps {
  title: string;
  link: string;
}

const DescLink: React.FC<LinkProps> = ({ title, link }) => {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="a-link desc-link"
      href={link}
    >
      {title}
      <OpenInNewIcon className="icon" />
    </a>
  );
};

export default DescLink;
