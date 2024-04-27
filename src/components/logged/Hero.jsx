import React from "react";
import appealbg from "../../assets/appealbg.png";

import { AiFillCheckCircle } from "react-icons/ai";
import { Link } from "react-router-dom";
import About from "./About";
import HeroNav from "./HeroNav";
const Hero = () => {
  return (
    <div>
      <HeroNav />
      <div className="absolute z-[-10]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#00FFFF"
            fill-opacity="1"
            d="M0,128L21.8,128C43.6,128,87,128,131,149.3C174.5,171,218,213,262,234.7C305.5,256,349,256,393,224C436.4,192,480,128,524,112C567.3,96,611,128,655,122.7C698.2,117,742,75,785,85.3C829.1,96,873,160,916,192C960,224,1004,224,1047,197.3C1090.9,171,1135,117,1178,101.3C1221.8,85,1265,107,1309,144C1352.7,181,1396,235,1418,261.3L1440,288L1440,0L1418.2,0C1396.4,0,1353,0,1309,0C1265.5,0,1222,0,1178,0C1134.5,0,1091,0,1047,0C1003.6,0,960,0,916,0C872.7,0,829,0,785,0C741.8,0,698,0,655,0C610.9,0,567,0,524,0C480,0,436,0,393,0C349.1,0,305,0,262,0C218.2,0,175,0,131,0C87.3,0,44,0,22,0L0,0Z"
          ></path>
        </svg>
      </div>
      <div className="h-screen flex justify-center px-3 md:px-0 items-center bg-transparent">
        <img
          className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
          src={appealbg}
          alt=""
        />
        <div></div>
      </div>
      <div>
        <About />
      </div>
    </div>
  );
};

export default Hero;
