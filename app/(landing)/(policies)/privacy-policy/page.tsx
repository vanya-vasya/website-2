import CTA from "@/components/landing/cta";

const PrivacyPolicy = () => {
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
              <h3 className="page-title__title" style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>Privacy Policy</h3>
            </div>
            <p className="page-title__text" style={{ color: 'black' }}>
              Updated: 25 October 2025 (Asia/Tbilisi)
            </p>
            <p className="page-title__text" style={{ color: 'black', marginTop: '10px' }}>
              We strongly encourage you to read this Privacy Policy, as it explains important aspects of your personal data.
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
                    Welcome to nerbixa.com! This Privacy Policy outlines how we collect, use, share, and protect your information when you visit our website or use our AI-powered services. Please review this policy carefully. If you do not agree with its terms, we kindly ask that you refrain from accessing or using our site.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Information We Collect
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Personal Information:</strong> When you register on nerbixa.com, we may collect details such as your name, email address, and payment information (if you use any paid features or services).
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Usage Information:</strong> We may gather technical data about how you interact with our website, including your IP address, browser type, device details, time zone, and browsing activity.
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    How We Use Your Information
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>To Provide and Improve Services:</strong> We utilize your information to provide access to our tools and continuously refine the functionality and efficiency of our platform.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>User Communication:</strong> Your contact details may be used to share announcements, product updates, newsletters, or important service notifications regarding your activity on nerbixa.com.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Payments & Account Handling:</strong> Payment information is processed to enable paid features, while account details are managed to ensure smooth operation and accuracy.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Safety & Legal Compliance:</strong> Collected data assists us in protecting our services, preventing misuse, and fulfilling our obligations under applicable laws.
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    How We Share Your Information
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Service Partners:</strong> We may provide your information to reliable third-party providers that support us with services such as payment handling, analytics, or technical maintenance.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Compliance with Law:</strong> Your data may be shared if necessary to meet legal requirements or to respond to official requests from government authorities.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Business Transitions:</strong> Should nerbixa.com undergo a merger, acquisition, or restructuring, your information could be included among the assets transferred.
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>Data Security</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    Your personal information is secured through appropriate measures designed to prevent unauthorized use, alteration, or exposure. We regularly review and update our security practices to address emerging threats and maintain data integrity. Despite these efforts, no system can guarantee complete protection, but we are committed to applying industry-standard safeguards to keep your data as safe as possible.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>Your Rights</h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Access:</strong> You have the right to request a copy of the personal information we hold about you.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Correction:</strong> If any of your details are inaccurate or incomplete, you may ask us to update or correct them.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Deletion:</strong> You can request the removal of your personal data from our systems, subject to certain legal or contractual obligations.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Objection:</strong> In specific situations, you may object to how we process your information.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Portability:</strong> You may request your personal data in a structured, commonly used, and machine-readable format.
                      </p>
                    </li>
                  </ul>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    To exercise your rights, please contact us at support@nerbixa.com.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Changes to This Privacy Policy
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    This policy may be revised periodically, and any changes will be reflected on this page with an updated &quot;effective date.&quot; We encourage you to review it regularly to stay informed.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>Contact Us</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    If you have any questions or concerns about this Privacy
                    Policy, please contact us at support@nerbixa.com.
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

export default PrivacyPolicy;
