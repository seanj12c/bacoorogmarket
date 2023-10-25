import React from "react";
import bacoor from "../../assets/bacoor.png";
import { AiFillCheckCircle } from "react-icons/ai";
import NavbarNotLogged from "./NavbarNotLogged";
import GAbout from "./GAbout";
import GFaq from "./GFaq";
const Landing = () => {
  return (
    <div>
      <NavbarNotLogged />
      <div
        id="home"
        className="h-screen items-center w-full py-24 lg:pt-28 px-2 md:px-6 lg:px-20 md:flex flex-row-reverse"
      >
        <div className="md:w-1/2 flex justify-center">
          <img
            className="h-72 md:h-96 lg:h-[450px] md:ml-auto object-contain md:pl-10"
            src={bacoor}
            alt=""
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-center text-base md:text-left md:text-3xl lg:text-4xl xl:text-5xl font-semibold">
            A <span className="text-primary">Marketplace</span> that you are
            looking for
          </h1>
          <p className="text-xs text-gray-900 xl:text-base py-2 text-justify">
            Embark on a journey through the flavors of the sea with a delightful
            array of fresh mussels and oysters, thoughtfully sourced for your
            culinary explorations. Experience the convenience of easy access to
            these oceanic treasures, bringing the taste of the sea right to your
            table in Bacoor City, Cavite, Philippines.
          </p>
          <div className="flex gap-2 items-center text-xs md:text-base xl:text-lg">
            <div>
              <AiFillCheckCircle className="text-primary" size={17} />
            </div>
            <div>
              <span className="font-bold">Pinned Location</span> - easily locate
              seller with the use of google map pinned location.
            </div>
          </div>
          <div className="flex gap-2 items-center text-xs md:text-base xl:text-lg">
            <div>
              <AiFillCheckCircle className="text-primary" size={17} />
            </div>
            <div>
              <span className="font-bold">Chat With Seller</span> - anytime,
              anywhere you can easily contact sellers.
            </div>
          </div>
          <div className="flex gap-2 items-center text-xs md:text-base xl:text-lg">
            <div>
              <AiFillCheckCircle className="text-primary" size={17} />
            </div>
            <div>
              <span className="font-bold">Fresh Products</span> - guaranteeing
              you the finest and freshest harvest oysters and mussels.
            </div>
          </div>
        </div>
      </div>
      <div id="about">
        <GAbout />
      </div>
      <div id="faqs">
        <GFaq />
      </div>
    </div>
  );
};

export default Landing;
