import React from "react";
import { AiFillDollarCircle } from "react-icons/ai";

const About = () => {
  return (
    <div className="md:h-screen h-full w-full py-24 px-2 lg:px-20 md:flex md:px-6 md:justify-around items-center">
      <div className="md:w-1/3">
        <h1 className="text-center md:text-lg lg:text-3xl md:text-left font-bold">
          A fully featured React components library for your next project
        </h1>
        <p className="text-justify text-xs md:text-base">
          Build fully functional accessible web applications faster than ever –
          Mantine includes more than 120 customizable components and hooks to
          cover you in any situation
        </p>
        <div className="flex justify-center md:justify-start py-1">
          <button className="px-4 py-2 text-xs md:text-base bg-primary text-white rounded-md border-2 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]">
            Get Started
          </button>
        </div>
      </div>
      <div className="md:w-1/2">
        <div className="grid md:grid-cols-2 justify-center">
          {/* box1 */}
          <div className="md:p-2">
            <AiFillDollarCircle size={30} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Free and open source
            </h1>
            <p className="text-xs md:text-base">
              All packages are published under MIT license, you can use Mantine
              in any project
            </p>
          </div>
          {/* box1 */}
          <div className="md:p-2">
            <AiFillDollarCircle size={30} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Free and open source
            </h1>
            <p className="text-xs md:text-base">
              All packages are published under MIT license, you can use Mantine
              in any project
            </p>
          </div>
          {/* box1 */}
          <div className="md:p-2">
            <AiFillDollarCircle size={30} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Free and open source
            </h1>
            <p className="text-xs md:text-base">
              All packages are published under MIT license, you can use Mantine
              in any project
            </p>
          </div>
          {/* box1 */}
          <div className="md:p-2">
            <AiFillDollarCircle size={30} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
              Free and open source
            </h1>
            <p className="text-xs md:text-base">
              All packages are published under MIT license, you can use Mantine
              in any project
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
