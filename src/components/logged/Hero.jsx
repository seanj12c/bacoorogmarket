import React from "react";
import herobg from "../../assets/herobg.png";
import heroimg from "../../assets/heroimg.png";
import { Link } from "react-router-dom";
import About from "./About";
import HeroNav from "./HeroNav";
import blob from "../../assets/blob.png";
const Hero = () => {
  return (
    <div>
      <HeroNav />

      <div className="h-screen flex justify-center px-3 md:px-0 items-center bg-transparent">
        <img
          className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
          src={herobg}
          alt=""
        />
        <img
          src={blob}
          className="absolute md:block hidden bottom-0 left-[-5px] w-44 h-44 object-contain"
          alt=""
        />
        <div className="flex flex-col-reverse md:flex-row items-center w-full md:justify-around justify-center lg:gap-10">
          <div className="text-white text-center md:text-start space-y-2">
            <h1 className="font-linden text- md:text-xl underline">
              BACOOR OCEAN GEM MARKET
            </h1>
            <h1 className="text-[#00FFFF] hidden md:block md:text-4xl lg:text-5xl xl:text-6xl font-linden">
              YOUR OYSTERS
              <br />& MUSSELS
            </h1>
            <h1 className="text-[#00FFFF] md:hidden text-2xl font-linden">
              YOUR OYSTERS & MUSSELS
            </h1>
            <h1 className="font-linden text- md:text-2xl">
              <span className="underline font-linden">CONN</span>ECTION
            </h1>
          </div>
          <div className="">
            <img
              src={heroimg}
              className="max-w-xs sm:max-w-sm lg:max-w-lg w-full"
              alt=""
            />
          </div>
        </div>
      </div>

      <div>
        <About />
      </div>
    </div>
  );
};

export default Hero;
