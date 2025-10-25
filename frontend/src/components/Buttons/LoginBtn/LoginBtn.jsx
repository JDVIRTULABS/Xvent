import React from "react";
import "./LoginBtn.css";
import { Link } from "react-router-dom";

const LoginBtn = ({ title, link }) => {
  return (
    <Link to={link} className="LoginBtnContainer">
      <p className="LoginPara">{title}</p>
    </Link>
  );
};

export default LoginBtn;
