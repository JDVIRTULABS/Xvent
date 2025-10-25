import React from "react";
import "./NavbarDesktop.css";
import LoginBtn from "../Buttons/LoginBtn/LoginBtn";
import SignupBtn from "../Buttons/SignupBtn/SignupBtn";
import { IoMdAddCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";

const NavbarDesktop = () => {
  const Navlinks = [
    {
      NavTitle: "Home",
      link: "/",
    },
  ];

  return (
    <nav id="navbarContainer">
      <div className="NavbarNavLinks">
        <ul>
          {Navlinks.map((links, index) => (
            <li key={index}>{links.NavTitle}</li>
          ))}
        </ul>
        <IoMdAddCircleOutline fontSize={"30px"} cursor={"pointer"} />
      </div>
      <div id="mainLogo">
        <Link to="/">
          <img src="/XventLogo" alt="Xvent Logo" />
        </Link>
      </div>

      <div className="NavbarBtns">
        <LoginBtn title="Login" link="/signin" />
        <SignupBtn title="Sign up" link="/signup" theme="black" txtFont={"medium"}/>
      </div>
    </nav>
  );
};

export default NavbarDesktop;
