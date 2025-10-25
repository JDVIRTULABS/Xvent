import React from "react";
import "./HomePage.css";
import Slide from "../../components/Slides/Slide";
import HomePageFeatureCard from "../../components/Cards/HomePageFeatureCard/HomePageFeatureCard";

const HomePage = () => {
  return (
    <section id="HomePageContainer">
      <Slide />
      <div className="featureContent">
        <h2>Discover and Create <br /> Unforgettable Experiences</h2>
        <p>
          We empower you to explore a variety of events tailored to your
          interests. From lively college fests to intimate meetups, there's
          something for everyone.
        </p>
      </div>
      <HomePageFeatureCard/>
    </section>
  );
};

export default HomePage;
