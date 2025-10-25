import React from "react";
import "./FeatureSubCards.css";
// import featureIcon from "../../../assets/HomePageUtils/featrueicon1.svg";

const FeatureSubCards = ({featureIcon, name, detail}) => {


  return (
    <div className="featureSubCardContainer">
      <img src={featureIcon} alt="" />
      <h3>{name}</h3>
      <p>{detail}</p>
    </div>
  );
};

export default FeatureSubCards;
