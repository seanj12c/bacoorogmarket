import React, { useState } from "react";

const PrivacyPolicy = ({ onContinue }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isTagalog, setIsTagalog] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleContinueClick = () => {
    if (isChecked) {
      onContinue();
    }
  };

  const toggleLanguage = () => {
    setIsTagalog(!isTagalog);
  };

  return (
    <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md lg:max-w-xl p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-primary">Privacy Policy</h2>
        <div
          className="text-xs lg:text-base"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {isTagalog ? (
            <div>
              <p className="font-bold">1. Introdaksyon</p>
              <p>
                Maligayang pagdating sa Bacoor Ocean Gem Market, isang web-based
                na marketplace para sa mga talaba at tahong. Igagalang namin ang
                iyong privacy at may layunin kaming pangalagaan ang iyong
                personal na impormasyon. Ang Patakaran sa Privacy na ito ay
                inilalatag upang tulungan kang maunawaan kung paano namin
                kinokolekta, ginagamit, at pinoprotektahan ang iyong mga datos.
                Sa paggamit ng aming mga serbisyo, sumasang-ayon ka sa mga
                pamamaraang inilalarawan sa patakaran na ito.
              </p>
              <div className="py-2">
                <p className="font-bold">2. Impormasyong kinokolekta namin</p>
                <p>
                  Kami ay kumokolekta ng impormasyon mula sa iyo kapag ginagamit
                  mo ang aming website, lalo na kapag ikaw ay nagrehistro. Ang
                  impormasyon na maaaring aming kolektahin ay kinabibilangan
                  ngunit hindi limitado sa:
                </p>
                <p>
                  <span className="font-bold">
                    2.1 Personal na Impormasyon:
                  </span>{" "}
                  Maaaring isama dito ang iyong pangalan, email address, at iba
                  pang impormasyon sa pakikipag-ugnayan.
                </p>
                <p>
                  <span className="font-bold">
                    2.2 Impormasyon sa pag Register:
                  </span>{" "}
                  Impormasyon na ibinibigay mo kapag nagpaparehistro, tulad ng
                  iyong datos mula sa iyong Google account.
                </p>
                <p>
                  <span className="font-bold">2.3 Komunikasyon:</span>{" "}
                  Kokolektahin namin ang lahat ng data sa conversation ng user.
                </p>
                <p>
                  <span className="font-bold">
                    2.4 Impormasyon ng Cellphone/Kompyuter:
                  </span>{" "}
                  Maaari naming makuha ang iyong impormasyon sa lokasyon.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">
                  3. Paano namin ginagamit ang inyong impormasyon
                </p>
                <p>
                  Ginagamit namin ang impormasyong kinokolekta namin para sa
                  iba't ibang layunin, kabilang ang:
                </p>
              </div>
              <p>
                <span className="font-bold">3.1. Serbisyo ng Marketplace:</span>
                Upang mabigyan ka ng aming mga serbisyo sa marketplace at
                mapadali ang mga transaksyon sa pagitan ng impormasyon ng mga
                nagbebenta at mamimili.
              </p>
              <p>
                <span className="font-bold">3.2. Komunikasyon:</span>Upang
                paganahin ang komunikasyon sa pagitan ng mga user at para sa mga
                layunin ng suporta sa customer.
              </p>
              <p>
                <span className="font-bold">3.3. Pagpapabuti:</span>Upang
                mapabuti at mapahusay ang paggana ng aming website at karanasan
                ng gumagamit.
              </p>
              <p>
                <span className="font-bold">3.4. Seguridad:</span>Upang
                protektahan ang aming mga user at ang aming website mula sa
                panloloko, banta sa seguridad, at mga ilegal na aktibidad.
              </p>
              <div className="py-2">
                <p className="font-bold">4. Pagbabahagi ng Impormasyon</p>
                <p>
                  Hindi namin ibinebenta, kinakalakal, o kung hindi man ay
                  inililipat ang iyong personal na impormasyon sa mga ikatlong
                  partido nang wala ang iyong tahasang pahintulot.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">
                  5. Cookies at pag sukat ng Teknolohiya
                </p>
                <p>
                  Maaari kaming gumamit ng cookies at mga katulad na teknolohiya
                  sa pagsubaybay upang mapahusay ang iyong karanasan ng user sa
                  aming website. Maaari mong pamahalaan ang mga teknolohiyang
                  ito sa pamamagitan ng mga setting ng iyong browser.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">6. Seguridad ng Data</p>
                <p>
                  Sineseryoso namin ang seguridad ng data at nagpapatupad ng
                  naaangkop na mga hakbang sa seguridad upang maprotektahan ang
                  iyong personal na impormasyon mula sa hindi awtorisadong
                  pag-access o pagsisiwalat.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">7. Ang iyong mga Karapatan</p>
                <p>
                  May karapatan kang i-access, itama, at tanggalin ang iyong
                  personal na impormasyon. Magagawa mo ito sa pamamagitan ng
                  pag-access sa mga setting ng iyong account.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">8. Privacy ng mga bata:</p>
                <p>
                  Ang aming mga serbisyo ay hindi nakadirekta sa mga indibidwal
                  na wala pang 18 taong gulang. Kung ikaw ay isang magulang o
                  tagapag-alaga at naniniwala na ang iyong anak ay nagbigay sa
                  amin ng personal na impormasyon, mangyaring makipag-ugnayan sa
                  amin, at gagawa kami ng mga hakbang upang alisin ang
                  impormasyong iyon mula sa aming mga system.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">
                  9. Mga pagbabago sa Patakaran sa Privacy
                </p>
                <p>
                  Maaari naming i-update ang Patakaran sa Privacy na ito habang
                  nagbabago ang aming mga serbisyo o ayon sa kinakailangan ng
                  batas. Ang binagong patakaran ay ipo-post sa aming website, at
                  ang petsa ng bisa ay ia-update nang naaayon.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">10. Pag-delete ng Account</p>
                <p>
                  Sa sandaling tanggalin mo ang iyong account, kakailanganin
                  mong gumamit ng isa pang Gmail upang mag-log in muli, at hindi
                  mo na muling gagamitin ang tinanggal na account.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">11. Kontakin mo kami sa:</p>
                <p>
                  Kung mayroon kang anumang mga tanong o alalahanin tungkol sa
                  Patakaran sa Privacy na ito o sa aming mga kasanayan sa data,
                  mangyaring makipag-ugnayan sa amin sa{" "}
                  <span className="text-primary underline">
                    <a href="mailto:bacoorogmarket@gmail.com">
                      bacoorogmarket@gmail.com
                    </a>
                  </span>
                  .
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-bold">1. Introduction</p>
              <p>
                Welcome to Bacoor Ocean Gem Market, a web-based marketplace for
                oysters and mussels. We respect your privacy and are committed
                to protecting your personal information. This Privacy Policy is
                designed to help you understand how we collect, use, and
                safeguard your data. By using our services, you consent to the
                practices described in this policy.
              </p>
              <div className="py-2">
                <p className="font-bold">2. Information We Collect</p>
                <p>
                  We collect information from you when you use our website,
                  particularly when you register. The information we may collect
                  includes, but is not limited to:
                </p>
              </div>
              <p>
                <span className="font-bold">2.1. Personal Information: </span>
                This may include your name, email address, and other contact
                information.
              </p>
              <p>
                <span className="font-bold">2.2. Registration Data: </span>
                Information you provide when registering, such as your data from
                your Google account
              </p>
              <p>
                <span className="font-bold">2.3. Communications: </span>We will
                collect all the data from the conversation of the user.
              </p>
              <p>
                <span className="font-bold">2.4. Device Information: </span>We
                may get your location information.
              </p>
              <div className="py-2">
                <p className="font-bold">3. How We Use Your Information</p>
                <p>
                  We use the information we collect for various purposes,
                  including:
                </p>
              </div>
              <p>
                <span className="font-bold">3.1. Marketplace Services:</span>To
                provide you with our marketplace services and facilitate
                transactions between sellers and consumers information.
              </p>
              <p>
                <span className="font-bold">3.2. Communication:</span>To enable
                communication between users and for customer support purposes.
              </p>
              <p>
                <span className="font-bold">3.3. Improvement:</span>To improve
                and enhance our website's functionality and user experience.
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
                  information to third parties without your explicit consent.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">
                  5. Cookies and Tracking Technologies
                </p>
                <p>
                  We may use cookies and similar tracking technologies to
                  enhance your user experience on our website. You can manage
                  these technologies through your browser settings.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">6. Data Security</p>
                <p>
                  We take data security seriously and implement appropriate
                  security measures to protect your personal information from
                  unauthorized access or disclosure.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">7. Your Rights</p>
                <p>
                  You have the right to access, correct, and delete your
                  personal information. You can do this by accessing your
                  account settings.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">8. Children's Privacy</p>
                <p>
                  Our services are not directed to individuals under the age of
                  18. If you are a parent or guardian and believe that your
                  child has provided us with personal information, please
                  contact us, and we will take steps to remove that information
                  from our systems.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">9. Changes to this Privacy Policy</p>
                <p>
                  We may update this Privacy Policy as our services evolve or as
                  required by law. The revised policy will be posted on our
                  website, and the effective date will be updated accordingly.
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">10. Deletion of Account</p>
                <p>
                  Once you delete your account, you will need to use another
                  Gmail to log in again, and you will never use the deleted
                  account again
                </p>
              </div>
              <div className="py-2">
                <p className="font-bold">11. Contact Us</p>
                <p>
                  If you have any questions or concerns about this Privacy
                  Policy or our data practices, please contact us at{" "}
                  <span className="text-primary underline">
                    <a href="mailto:bacoorogmarket@gmail.com">
                      bacoorogmarket@gmail.com
                    </a>
                  </span>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className="btn btn-sm md:btn-sm  btn-primary   mr-2"
            onClick={toggleLanguage}
          >
            Change the language to {isTagalog ? "English" : "Tagalog"}
          </button>
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
            className={`btn btn-primary${
              isChecked
                ? ""
                : "btn no-animation  opacity-60 cursor-not-allowed "
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
