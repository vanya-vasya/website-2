"use client";

import CTA from "@/components/landing/cta";
import { useTranslations } from "next-intl";

const TermsAndConditions = () => {
  const t = useTranslations("policies.termsAndConditions");

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
                  <p className="career-page-top__text-1 pt-8" style={{ color: 'black' }}>
                    {t("agree")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("useOfServices")}
                  </h4>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("eligibility")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("eligibilityDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("registration")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("registrationDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("aiGenerations")}
                  </h4>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("freeGenerations")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("freeGenerationsDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("aiGenerationModels")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("aiGenerationModelsDesc")}
                  </p>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li className="mt-[26px]">
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("chatAssistant")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("imageGeneration")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("videoGeneration")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("musicGeneration")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("speechGeneration")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("codeGeneration")}</p>
                    </li>
                  </ul>
                  <p className="career-page-top__text-1 mt-[26px]" style={{ color: 'black' }}>
                    {t("freeGenerationsExample")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("userConduct")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("userConductDesc")}
                  </p>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li className="mt-[26px]">
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("violatingLaws")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>
                        {t("infringing")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("harmfulSoftware")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>
                        {t("disrupting")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("intellectualProperty")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("intellectualPropertyDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("disclaimer")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("disclaimerDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("limitation")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("limitationDesc")}
                  </p>
                  <ul className="career-page-top__points-list list-unstyled">
                    <li className="mt-[26px]">
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>{t("useInability")}</p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>
                        {t("unauthorizedAccess")}
                      </p>
                    </li>
                    <li>
                      <div className="career-page-top__points-shape"></div>
                      <p style={{ color: 'black' }}>
                        {t("bugsViruses")}
                      </p>
                    </li>
                  </ul>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("indemnification")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("indemnificationDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>
                    {t("changes")}
                  </h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("changesDesc")}
                  </p>
                  <h4 className="career-page-top__title-3" style={{ color: 'black' }}>{t("governingLaw")}</h4>
                  <p className="career-page-top__text-1" style={{ color: 'black' }}>
                    {t("governingLawDesc")}
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

export default TermsAndConditions;
