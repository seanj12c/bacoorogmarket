import React from "react";

import faq from "../../assets/faq.png";

const Faq = () => {
  return (
    <div
      id="FAQs"
      className=" min-h-screen flex items-center justify-center p-4 md:p-8 py-24 rounded-lg shadow-lg"
    >
      <div className="md:flex gap-6">
        <div className="md:w-1/2">
          <img
            src={faq}
            alt="FAQ Illustration"
            className="h-96 mx-auto object-contain"
          />
        </div>
        <div className="md:w-1/2 mt-4 md:mt-0">
          <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-center lg:text-left">
            Frequently Asked Questions
          </h2>
          <ul className="flex flex-col">
            <div className="dropdown w-full">
              <div tabIndex={0} role="button" className="btn m-1 w-full">
                Based on how the mussel looks, what to eat and what to avoid?
              </div>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-primary text-primary-content"
              >
                <div className="card-body">
                  <h3 className="card-title">Answer</h3>
                  <p>
                    Mussels are only allowed when they are fresh and green since
                    they are not allowed when they are black. It's also known as
                    'bahong'.
                  </p>
                </div>
              </div>
            </div>
            <div className="dropdown w-full">
              <div tabIndex={0} role="button" className="btn m-1 w-full">
                When do the mussels and oysters expire?
              </div>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-primary text-primary-content"
              >
                <div className="card-body">
                  <h3 className="card-title">Answer</h3>
                  <p>
                    Mussels can live for up to 4-5 days after getting farmed,
                    whereas oysters last 10-14 days.
                  </p>
                </div>
              </div>
            </div>
            <div className="dropdown w-full">
              <div tabIndex={0} role="button" className="btn m-1 w-full">
                How to know if the mussels and oysters are fresh?
              </div>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-primary text-primary-content"
              >
                <div className="card-body">
                  <h3 className="card-title">Answer</h3>
                  <p>
                    Fresh mussels should have tightly closed shells or those
                    that close when tapped; oysters should have closed shells,
                    avoiding those that are wide open or cracked.
                  </p>
                </div>
              </div>
            </div>
            <div className="dropdown w-full">
              <div tabIndex={0} role="button" className="btn m-1 w-full">
                Does eating oysters and mussles have any health benefits?
              </div>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-primary text-primary-content"
              >
                <div className="card-body">
                  <h3 className="card-title">Answer</h3>
                  <p>
                    Oysters and mussles includes high level of protein,
                    vitamins, and minerals such as zinc, iron and omega-3 fatty
                    acids.
                  </p>
                </div>
              </div>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Faq;
