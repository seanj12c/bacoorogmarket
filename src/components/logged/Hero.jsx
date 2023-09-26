import React from "react";
import bacoor from "../../assets/bacoor.png";

import { AiFillCheckCircle } from "react-icons/ai";
const Hero = () => {
  return (
    <div>
      <div className="h-screen items-center w-full pt-24 px-2 md:px-6 lg:px-20 md:flex flex-row-reverse">
        <div className="md:w-1/2 flex justify-center">
          <img
            className="h-72 md:h-96 lg:h-[450px] md:ml-auto"
            src={bacoor}
            alt=""
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-center md:text-left md:text-3xl lg:text-5xl font-semibold">
            A <span className="text-primary">Marketplace</span> that you are
            looking for
          </h1>
          <p className="text-xs text-gray-900 lg:text-base md:py-2 text-justify">
            Embark on a journey through the flavors of the sea with a delightful
            array of fresh mussels and oysters, thoughtfully sourced for your
            culinary explorations. Experience the convenience of easy access to
            these oceanic treasures, bringing the taste of the sea right to your
            table in Bacoor City, Cavite, Philippines.
          </p>
          <div className="flex gap-2 items-center text-xs md:text-base lg:text-lg">
            <div>
              <AiFillCheckCircle className="text-primary" size={17} />
            </div>
            <div>
              <span className="font-bold">Pinned Location</span> - easily locate
              seller with the use of google map pinned location.
            </div>
          </div>
          <div className="flex gap-2 items-center text-xs md:text-base lg:text-lg">
            <div>
              <AiFillCheckCircle className="text-primary" size={17} />
            </div>
            <div>
              <span className="font-bold">Chat With Seller</span> - anytime,
              anywhere you can easily contact sellers.
            </div>
          </div>
          <div className="flex gap-2 items-center text-xs md:text-base lg:text-lg">
            <div>
              <AiFillCheckCircle className="text-primary" size={17} />
            </div>
            <div>
              <span className="font-bold">Fresh Products</span> - guaranteeing
              you the finest and freshest harvest oysters and mussels.
            </div>
          </div>
          <div className="flex justify-center md:justify-start py-1">
            <button className="px-4 py-2 bg-primary text-white rounded-md transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
