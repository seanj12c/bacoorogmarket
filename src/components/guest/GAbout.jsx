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
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur,
          assumenda?
        </h1>
        <p className="text-justify text-xs md:text-base">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro
          voluptate, ratione maxime aperiam debitis corrupti est omnis ipsam ut
          accusantium nisi, perspiciatis enim, ipsum laboriosam!
        </p>
        <div className="flex justify-center md:justify-start py-1">
          <button className="px-4 py-2 text-xs md:text-base bg-primary text-white rounded-md border-2 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]">
            Get Started
          </button>
        </div>
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
