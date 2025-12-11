"use client";

import CTA from "@/components/landing/cta";
import { useTranslations } from "next-intl";

const CookiesPolicy = () => {
  const t = useTranslations("policies.cookiesPolicy");

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
                    {t("whatAreCookies")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("whatAreCookiesDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("typesOfCookies")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("typesOfCookiesDesc")}
                  </p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("essentialCookies")}</strong> {t("essentialCookiesDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("performanceCookies")}</strong> {t("performanceCookiesDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("functionalityCookies")}</strong> {t("functionalityCookiesDesc")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        <strong>{t("advertisingCookies")}</strong> {t("advertisingCookiesDesc")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("thirdPartyCookies")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("thirdPartyCookiesDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("howWeUseCookies")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>{t("howWeUseCookiesDesc")}</p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>{t("properFunctioning")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        {t("enhanceExperience")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        {t("analyzeUsage")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        {t("personalizedContent")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("yourChoices")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("yourChoicesDesc")}
                  </p>
                  <ul className="career-page-top__points-list list-unstyled pt-4">
                    <li>
                      <div className="career-page-top__points-shape"></div>
                        <p style={{ color: 'black' }}>{t("blockDelete")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        {t("optOut")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                                              <p style={{ color: 'black' }}>
                        {t("adjustPreferences")}
                      </p>
                    </li>
                  </ul>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("note")}
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

export default CookiesPolicy;
