import React from "react";
import "./Slide.css";
import RoundedBtnActive from "../Buttons/RoundedBtnActive/RoundedBtnActive";
import coverImage from "../../assets/HomePageUtils/homepageCoverPage.png";
import LoginBtn from "../Buttons/LoginBtn/LoginBtn";
import SignupBtn from "../Buttons/SignupBtn/SignupBtn";

const Slide = () => {
  return (
    <div
      className="slideMainContainer"
      style={{ backgroundImage: `url(${coverImage})` }}
    >
      <div className="slideSubMainContainer">
        <div className="slideMainLeftContainer">
          <h2>
            Discover Events.
            <br />
            Meet People.
            <br />
            Join Communities.
          </h2>
          <p>
            Xvent is where college events, meetups, and <br /> experiences come
            together — all in one place.
          </p>
          <div className="slideBtns">
            <SignupBtn
              title="Explore"
              link=" "
              theme="outline"
              txtFont={"small"}
            />
            <SignupBtn
              title="Login"
              link=" "
              theme="orange"
              txtFont={"small"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide;
