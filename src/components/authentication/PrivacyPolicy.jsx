import React, { useState } from "react";

const PrivacyPolicy = ({ onContinue }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleContinueClick = () => {
    if (isChecked) {
      onContinue();
    }
  };

  return (
    <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-primary">Privacy Policy</h2>
        <div
          className="text-xs lg:text-base"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <div className="py-2">
            <p className="font-bold">1. Introduction</p>
            <p>
              Welcome to Bacoor Ocean Gem Market, a web-based marketplace for
              oysters and mussels. We respect your privacy and are committed to
              protecting your personal information. This Privacy Policy is
              designed to help you understand how we collect, use, and safeguard
              your data. By using our services, you consent to the practices
              described in this policy.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">2. Information We Collect</p>
            <p>
              We collect information from you when you use our website,
              particularly when you register as a user. The information we may
              collect includes, but is not limited to:
            </p>
          </div>
          <p>
            <span className="font-bold">2.1. Personal Information: </span>This
            may include your name, email address, and other contact information.
          </p>
          <p>
            <span className="font-bold">2.2. Registration Data: </span>
            Information you provide when registering, such as your username and
            password.
          </p>
          <p>
            <span className="font-bold">2.3. Communications: </span>We may
            collect information from your communications with other users
            through our communication system.
          </p>
          <p>
            <span className="font-bold">2.4. Device Information: </span>We may
            collect data about the devices you use to access our website,
            including IP addresses, browser information, and location
            information.
          </p>
          <div className="py-2">
            <p className="font-bold">3. How We Use Your Information</p>
            <p>
              We use the information we collect for various purposes, including:
            </p>
          </div>
          <p>
            <span className="font-bold">3.1. Marketplace Services:</span>To
            provide you with our marketplace services and facilitate
            transactions between sellers and consumers. information.
          </p>
          <p>
            <span className="font-bold">3.2. Communication:</span>To enable
            communication between users and for customer support purposes.
          </p>
          <p>
            <span className="font-bold">3.3. Improvement:</span>To improve and
            enhance our website's functionality and user experience.
          </p>
          <p>
            <span className="font-bold">3.4. Security:</span>To protect our
            users and our website from fraud, security threats, and illegal
            activities.
          </p>
          <div className="py-2">
            <p className="font-bold">4. Information Sharing</p>
            <p>
              We do not sell, trade, or otherwise transfer your personal
              information to third parties without your explicit consent. We may
              share information with trusted third parties who assist us in
              operating our website, conducting our business, or servicing you.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">5. Cookies and Tracking Technologies</p>
            <p>
              We may use cookies and similar tracking technologies to enhance
              your user experience on our website. You can manage these
              technologies through your browser settings.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">6. Data Security</p>
            <p>
              We take data security seriously and implement appropriate security
              measures to protect your personal information from unauthorized
              access or disclosure.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">7. Your Rights</p>
            <p>
              You have the right to access, correct, and delete your personal
              information. You can do this by accessing your account settings or
              by contacting us.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">8. Children's Privacy</p>
            <p>
              Our services are not directed to individuals under the age of 18.
              If you are a parent or guardian and believe that your child has
              provided us with personal information, please contact us, and we
              will take steps to remove that information from our systems.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">9. Changes to this Privacy Policy</p>
            <p>
              We may update this Privacy Policy as our services evolve or as
              required by law. The revised policy will be posted on our website,
              and the effective date will be updated accordingly.
            </p>
          </div>
          <div className="py-2">
            <p className="font-bold">10. Contact Us</p>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact us at{" "}
              <span className="text-primary underline">
                <a href="mailto:bacooroceangemmarket@gmail.com.">
                  bacooroceangemmarket@gmail.com.
                </a>
              </span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center cursor-pointer text-sm sm:text-base">
            <input
              type="checkbox"
              className="mr-2"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <div>
              <p>
                I agree to the{" "}
                <span className="text-primary">
                  Bacoor Ocean Gem Market Privacy Policy
                </span>
              </p>
            </div>
          </label>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className={`bg-primary text-white py-2 px-3 rounded-lg ${
              isChecked
                ? "hover:bg-primary-dark"
                : "opacity-50 cursor-not-allowed"
            } text-sm sm:text-base lg:text-lg`}
            onClick={handleContinueClick}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
