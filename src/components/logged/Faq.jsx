import React, { useState } from "react";
import { BsChevronCompactDown, BsChevronCompactUp } from "react-icons/bs";
import faq from "../../assets/faq.png";

const Faq = () => {
  const faqData = [
    {
      question: "Based on how the mussel looks, what to eat and what to avoid?",
      answer:
        "Mussels are only allowed when they are fresh and green since they are not allowed when they are black. It's also known as 'bahong'.",
    },
    {
      question: "When do the mussels and oysters expire?",
      answer:
        "Mussels can live for up to 4-5 days after getting farmed, whereas oysters last 10-14 days.",
    },
    {
      question: "How to know if the mussels and oysters are fresh?",
      answer: "sample",
    },
    {
      question: "Isa pa",
      answer: "Sample",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    if (openIndex === index) {
      // If the same question is clicked again, close it
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div
      id="FAQs"
      className="bg-white h-screen flex items-center justify-center md:pt-24 w-full p-4 md:p-8 py-24 rounded-lg shadow-lg"
    >
      <div className="md:flex gap-6">
        <div className="md:w-1/2">
          <img
            src={faq}
            alt="FAQ Illustration"
            className="lg:h-[450px] md:h-96 sm:h-72 h-52 mx-auto  object-contain"
          />
        </div>
        <div className="md:w-1/2 mt-4 md:mt-0">
          <h2 className="text-xl lg:text-2xl text-center lg:text-left font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <ul>
            {faqData.map((item, index) => (
              <li key={item.question} className="mb-4">
                <button
                  className={`flex justify-between w-full py-2 px-4 bg-primary text-white rounded-md focus:outline-none ${
                    openIndex === index ? "text-primary" : ""
                  }`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-xs md:text-base lg:text-lg">
                    {item.question}
                  </span>
                  {openIndex === index ? (
                    <BsChevronCompactUp className="text-white" size={24} />
                  ) : (
                    <BsChevronCompactDown className="text-white" size={24} />
                  )}
                </button>
                <div
                  className={`mt-2 p-4 ${
                    openIndex === index ? "bg-white text-primary" : "hidden"
                  } rounded-md`}
                >
                  <span className="text-xs md:text-base lg:text-lg">
                    {item.answer}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Faq;
