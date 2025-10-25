import React from "react";
import "./SignupBtn.css";
import { Link } from "react-router-dom";

const SignupBtn = ({ title, link, theme, txtFont }) => {
  const themeMap = {
    orange: "orangeBtn",
    black: "blackBtn",
    outline: "outlineBtn",
  };

  const fontSize = {
    large: "24px",
    medium: "20px",
    small: "18px",
  };

  const fontSizeClass = fontSize[txtFont] || "";

  const themeClass = themeMap[theme] || "";
  return (
    <Link to={link} className={`singupBtnContainer ${themeClass}`}>
      <p className="signupPara" style={{ fontSize: `${fontSizeClass}` }}>
        {title}
      </p>
    </Link>
  );
};

export default SignupBtn;
