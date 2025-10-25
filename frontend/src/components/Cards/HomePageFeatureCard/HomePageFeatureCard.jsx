import React from "react";
import "./HomePageFeatureCard.css";
import homepagefeaturecards from "../../../assets/HomePageUtils/homepagefeaturecards.png";
import FeatureSubCards from "../FeatureSubCards/FeatureSubCards";
import { HomePageFeatureCardsInfo } from "../../../Data/data";

const HomePageFeatureCard = () => {
  return (
    <div className="HomePageFeatureCardContainer">
      <div className="HomePageFeaturesubLeftCards HomePageFeaturesubCards">
        <FeatureSubCards
          featureIcon={HomePageFeatureCardsInfo[0].img}
          name={HomePageFeatureCardsInfo[0].title}
          detail={HomePageFeatureCardsInfo[0].content}
        />
        <FeatureSubCards
          featureIcon={HomePageFeatureCardsInfo[1].img}
          name={HomePageFeatureCardsInfo[1].title}
          detail={HomePageFeatureCardsInfo[1].content}
        />
      </div>
      <div className="HomePageFeaturesubMainCards">
        <img src={homepagefeaturecards} alt="" />
      </div>
      <div className="HomePageFeaturesubRightCards  HomePageFeaturesubCards">
        <FeatureSubCards
          featureIcon={HomePageFeatureCardsInfo[2].img}
          name={HomePageFeatureCardsInfo[2].title}
          detail={HomePageFeatureCardsInfo[2].content}
        />
        <FeatureSubCards
          featureIcon={HomePageFeatureCardsInfo[3].img}
          name={HomePageFeatureCardsInfo[3].title}
          detail={HomePageFeatureCardsInfo[3].content}
        />
      </div>
    </div>
  );
};

export default HomePageFeatureCard;
