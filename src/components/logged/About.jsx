import React from "react";
import { AiFillMessage } from "react-icons/ai";
import { PiCookingPotFill } from "react-icons/pi";
import { FaQuestion } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";

const About = () => {
  return (
    <div className="md:h-screen h-full w-full py-32 px-2 lg:px-20 md:flex md:px-6 md:justify-around items-center">
      <div className="md:w-1/3 pb-5 lg:pb-0">
        <h1 className="text-center md:text-lg lg:text-3xl md:text-left font-bold">
          Welcome to the Premier Marketplace for the Freshest Oysters and Green
          Mussels!
        </h1>
        <p className="text-justify text-xs md:text-base">
          At Bacoor Ocean Gem Market , we're passionate about bringing the
          ocean's finest treasures to your table. Our journey began with a deep
          love for the sea and a commitment to making the flavors of the ocean
          accessible to all seafood enthusiasts.
        </p>
      </div>
      <div className="md:w-1/2">
        <div className="grid sm:grid-cols-2 justify-center gap-5 max-w-xs mx-auto sm:mx-0 sm:max-w-none">
          {/* box1 */}
          <div className="md:p-2 text-center md:text-left">
            <AiFillMessage className="text-primary mx-auto md:mx-0" size={25} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Quick Chat
            </h1>
            <p className="text-xs md:text-base">
              Chat features where you can talk about anything about oysters and
              mussels.
            </p>
          </div>

          {/* box2 */}
          <div className="md:p-2 text-center md:text-left">
            <PiCookingPotFill
              className="text-primary mx-auto md:mx-0"
              size={25}
            />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Unique Recipe
            </h1>
            <p className="text-xs md:text-base">
              Different kinds of delicious recipe of oysters and mussels in
              Recipe
            </p>
          </div>
          {/* box3 */}
          <div className="md:p-2 text-center md:text-left">
            <FaQuestion className="text-primary mx-auto md:mx-0" size={25} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Frequently Asked Questions
            </h1>
            <p className="text-xs md:text-base">
              FAQs knows more information about oysters and mussels
            </p>
          </div>
          {/* box4 */}
          <div className="md:p-2 text-center md:text-left">
            <BsFillShieldLockFill
              className="text-primary mx-auto md:mx-0"
              size={25}
            />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Secure Login
            </h1>
            <p className="text-xs md:text-base">
              Be the one to sell or to buy, by logging in on our secured Login
              feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
