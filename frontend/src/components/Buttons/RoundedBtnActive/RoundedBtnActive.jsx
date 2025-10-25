import React from "react";
import "./RoundedBtnActive.css";

const RoundedBtnActive = ({
  type = "button",
  label = "Click Me",
  onClick,
  className = "",
  img = false,
  imgSrc = "",
  imgAlt = "btn-icon"
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`roundedActiveBtn ${className}`}
    >
      {img && <img src={imgSrc} alt={imgAlt} className="btn-icon" />}
      {label}
    </button>
  );
};

export default RoundedBtnActive;
