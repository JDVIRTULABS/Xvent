import React from "react";
import "./Footer.css";
import XventLogo from "../../assets/HomePageUtils/XventLogo.png";
import facebookLogo from "../../assets/HomePageUtils/facebookLogo.png";
import instagramLogo from "../../assets/HomePageUtils/instagramLogo.png";
import xLogo from "../../assets/HomePageUtils/xLogo.png";
import linkedinLogo from "../../assets/HomePageUtils/linkedinLogo.png";
import youtubeLogo from "../../assets/HomePageUtils/youtubeLogo.png";
import { Link } from "react-router-dom";


const Footer = () => {
  const footerSocialLinks = [
    {
      socialTitle: "Facebook",
      imagePath: facebookLogo,
      socialLinks: "https://www.facebook.com/",
    },
    {
      socialTitle: "Instagram",
      imagePath: instagramLogo,
      socialLinks: "https://www.instagram.com",
    },
    {
      socialTitle: "X",
      imagePath: xLogo,
      socialLinks: "https://www.x.com",
    },
    {
      socialTitle: "Linkedin",
      imagePath: linkedinLogo,
      socialLinks: "https://www.linkedin.com",
    },
    {
      socialTitle: "Youtube",
      imagePath: youtubeLogo,
      socialLinks: "https://www.youtube.com",
    },
  ];

  return (
    <footer id="FooterContainer">
      <div className="FooterMainLogo">
        <Link to="/">
        <img src={XventLogo} alt="Xvent Logo" />
        </Link>
      </div>
      <div className="FooterInfo">
        <p>© 2025 Xvent. All rights reserved.</p>
        <Link to="/privacy-policy" className="FooterInfoUnderline">
          Privacy Policy
        </Link>
        <Link to="/terms-of-service" className="FooterInfoUnderline">
          Terms of Service
        </Link>
      </div>
      <div className="FooterLinks">
        <ul>
          {footerSocialLinks.map(
            ({ socialTitle, imagePath, socialLinks }, idx) => (
              <li key={idx}>
                <a
                  href={socialLinks}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${socialTitle} page`}
                >
                  <img src={imagePath} alt={`${socialTitle} Logo`} />
                </a>
              </li>
            )
          )}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
