import CTA from "@/components/landing/cta";

const CookiesPolicy = () => {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      <section className="page-title" style={{ backgroundColor: 'white', position: 'relative' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .page-title::before, .page-title::after {
            display: none !important;
            content: none !important;
            background: none !important;
            filter: none !important;
          }
          .page-title__shape-1, .page-title__shape-2, .page-title__shape-3 {
            display: none !important;
          }
          .page-title {
            background: white !important;
            position: relative !important;
          }
          .page-title * {
            filter: none !important;
            background-image: none !important;
          }
        `}} />
        <div className="container">
          <div className="page-title__inner" style={{ padding: '60px 0 40px' }}>
            <div className="page-title__title-box">
              <h3 className="page-title__title" style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>Cookies Policy</h3>
            </div>
            <p className="page-title__text" style={{ color: 'black' }}>
              Updated: 25 October 2025
            </p>
            <p className="page-title__text" style={{ color: 'black', marginTop: '10px' }}>
              This Cookies Policy explains how our website uses cookies, why we use them, and how you can control their use. Please review it carefully to stay informed.
            </p>
          </div>
        </div>
      </section>
      <section className="career-page-top" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="career-page-top__inner">
            <div className="career-page-top__single">
              <div className="career-page-top__content-box" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', maxHeight: '70vh', overflowY: 'auto', padding: '30px' }}>
                <div className="career-page-top__content-box-two">

                  <p className="career-page-top__text-1 pt-8" style={{ color: 'black' }}>
                    At nerbixa.com, we use cookies to improve your browsing experience, deliver personalized features, and analyze site traffic. This Cookies Policy explains what cookies are, how we utilize them, and the choices you have for managing their use.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    What Are Cookies?
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    Cookies are small text files placed on your device when you visit our website. These files help us identify your device and store data about your preferences or previous actions on our site.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Types of Cookies We Use
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    We use the following types of cookies on nerbixa.com:
                  </p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Essential Cookies:</strong> These cookies are essential for the basic functioning of our website. They enable fundamental features like security, network management, and accessibility.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Performance and Analytics Cookies:</strong> These cookies help us collect data about how visitors interact with our website. This information is used to improve the site&apos;s performance and enhance our services. We use tools like Google Analytics for this purpose.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Functionality Cookies:</strong> These cookies allow our website to remember choices you make and offer a more personalized experience. For example, they can save your preferences across sessions.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Advertising and Targeting Cookies:</strong> These cookies help us deliver ads that are more relevant to your interests. They ensure that ads are displayed correctly and prevent the same ad from being shown repeatedly.
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Third-Party Cookies
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    In addition to our own cookies, we may use third-party cookies for purposes such as tracking website usage and displaying ads. These cookies are provided by third-party services, such as Google Analytics, which help us understand how visitors use our site.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    How We Use Cookies
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>Cookies are used for the following purposes:</p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>Ensure the proper and secure functioning of our website</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        Enhance your browsing experience by remembering your preferences and settings
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        Analyze how you use our website and identify areas for improvement
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        Deliver personalized content and advertising based on your interests
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Your Choices Regarding Cookies
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    You have various options for managing cookies on your device. You can:
                  </p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>Set your browser to block or delete cookies</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        Use opt-out tools provided by third-party services like Google Analytics
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        Adjust your preferences in our cookie consent manager, if available
                      </p>
                    </li>
                  </ul>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    Please note that blocking or deleting cookies may affect your ability to use certain features of our website and could impact your experience.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>Contact Us</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    If you have any questions regarding our use of cookies or need assistance managing your cookie preferences, feel free to contact us at support@nerbixa.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiesPolicy;
