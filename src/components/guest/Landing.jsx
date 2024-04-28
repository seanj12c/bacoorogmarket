import React from "react";
import NavbarNotLogged from "./NavbarNotLogged";
import GAbout from "./GAbout";
import GFaq from "./GFaq";

import herobg from "../../assets/herobg.png";
import heroimg from "../../assets/heroimg.png";
import blobblank from "../../assets/blobblank.png";
const Landing = () => {
  return (
    <div>
      <NavbarNotLogged />
      <div
        id="home"
        className="h-screen flex justify-center px-3 md:px-0 items-center bg-transparent"
      >
        <img
          className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
          src={herobg}
          alt=""
        />
        <img
          src={blobblank}
          className="absolute md:block hidden bottom-0 left-[-5px]  h-44 object-contain"
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
            <h1 className="font-linden md:text-2xl hidden md:block">
              <span className="underline font-linden ">CONN</span>
              ECTION
            </h1>
            <h1 className="font-linden md:hidden md:text-2xl">CONNECTION</h1>
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
      <div id="about">
        <GAbout />
      </div>
      <div className="pb-10" id="faqs">
        <GFaq />
      </div>
    </div>
  );
};

export default Landing;
