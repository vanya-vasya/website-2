import CTA from "@/components/landing/cta";

const ReturnPolicy = () => {
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
              <h3 className="page-title__title" style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>Return Policy</h3>
            </div>
            <p className="page-title__text" style={{ color: 'black' }}>
              Updated: 25 October 2025 (Asia/Tbilisi)
            </p>
            <p className="page-title__text" style={{ color: 'black', marginTop: '10px' }}>
              Our Return Policy outlines the process and conditions for service returns—please read thoroughly.
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
                    At nerbixa.com, we are committed to delivering high-quality AI generation services tailored to your needs. If for any reason you are not fully satisfied with your purchase, we provide a return option for unused generation credits. Our goal is to give you confidence in your purchases and ensure a smooth experience with our platform.
                  </p>
                  <p className="career-page-top__text-1 pt-4">
                    You may request a refund for any unused generations within 14 days of the purchase date. This policy applies to all generation packages offered on our website. Please review the conditions below to understand the requirements for returning unused generations.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Conditions for Returns
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Unused Generations:</strong> Refunds are available only for generation credits that remain unused. Once credits have been applied to any of our AI services—including text creation, image generation, or other tools offered on nerbixa.com—they are considered consumed and are not eligible for return or refund.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>14-Day Return Period:</strong> Return requests must be submitted within 14 days of the original purchase date. The 14-day period starts from the time the transaction is completed. Requests submitted after this window will not qualify for a refund.
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>Proof of Purchase:</strong> To process a return, you must provide valid proof of purchase. This may include an order confirmation email, a payment receipt, or any other documentation that confirms the purchase details and date of the generation package.
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    How to Request a Return
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    To initiate a return, please contact our support team
                    through our contact form on the website or by sending an
                    email to support@nerbixa.com. In your message, include the
                    following information:
                  </p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>Your full name and contact information</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>Order number and date of purchase</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>The reason for the return request</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        Proof of purchase (e.g., order confirmation email or
                        receipt)
                      </p>
                    </li>
                  </ul>
                  <p className="career-page-top__text-1 pt-4">
                    Once we receive your return request, our support team will review the information provided and process your request. If your return is approved, we will issue a refund to your original method of payment. Please allow up to 7 business days for the refund to appear in your account, depending on your payment provider.
                  </p>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    If additional information is required to process your return, our support team will contact you for further details. We are committed to resolving return requests as efficiently as possible to ensure your satisfaction.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    Non-Refundable Generations
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    Please be aware that once generations have been used, they are not eligible for a refund. This rule helps us preserve the reliability of our service and promote fair usage. We recommend reviewing your needs before purchasing generation credits.
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>Contact Us</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    If you have any questions or require assistance with a return, please reach out to our support team at support@nerbixa.com. Our team is ready to help with any concerns related to our return policy or any other aspect of our services.
                  </p>
                  <p className="career-page-top__text-1 pt-4">
                    We greatly value your feedback and are committed to delivering the best possible experience. Your satisfaction is our top priority, and we&apos;re here to support you whenever you need us.
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

export default ReturnPolicy;
