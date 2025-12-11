"use client";

import CTA from "@/components/landing/cta";
import { useTranslations } from "next-intl";

const PrivacyPolicy = () => {
  const t = useTranslations("policies.privacyPolicy");

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
              <h3 className="page-title__title" style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>{t("title")}</h3>
            </div>
            <p className="page-title__text" style={{ color: 'black' }}>
              {t("updated")}
            </p>
            <p className="page-title__text" style={{ color: 'black', marginTop: '10px' }}>
              {t("intro")}
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
                    {t("welcome")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("informationWeCollect")}
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("personalInformation")}</strong> {t("personalInformationDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("usageInformation")}</strong> {t("usageInformationDesc")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("howWeUse")}
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("provideServices")}</strong> {t("provideServicesDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("userCommunication")}</strong> {t("userCommunicationDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("paymentsAccount")}</strong> {t("paymentsAccountDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("safetyLegal")}</strong> {t("safetyLegalDesc")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("howWeShare")}
                  </h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("servicePartners")}</strong> {t("servicePartnersDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("complianceLaw")}</strong> {t("complianceLawDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("businessTransitions")}</strong> {t("businessTransitionsDesc")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("dataSecurity")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("dataSecurityDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("yourRights")}</h4>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("access")}</strong> {t("accessDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("correction")}</strong> {t("correctionDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("deletion")}</strong> {t("deletionDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("objection")}</strong> {t("objectionDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("portability")}</strong> {t("portabilityDesc")}
                      </p>
                    </li>
                  </ul>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("exerciseRights")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("changes")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("changesDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("contactUs")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("contactUsDesc")}
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
