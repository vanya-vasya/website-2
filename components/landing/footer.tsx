import { Building, FileText, Mail, MapPin, Instagram, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const routes = [
  {
    name: "Home",
    href: "/#home",
  },
  {
    name: "Solutions",
    href: "/#solutions",
  },
  {
    name: "Products",
    href: "/#features",
  },
  {
    name: "Why Us",
    href: "/#testimonials",
  },
];

const importantLinks = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms and Conditions",
    href: "/terms-and-conditions",
  },
  {
    name: "Return Policy",
    href: "/return-policy",
  },
  {
    name: "Cookies Policy",
    href: "/cookies-policy",
  },
];

const companyDetails = [
  {
    name: "Company: GUΑRΑΝТЕЕD GRЕΑТ SЕRVIСЕ LТD",
    icon: Building,
  },
  {
    name: "Company Number: 15982295",
    icon: FileText,
  },
  {
    name: "Phone Number: +44 7537167307",
    icon: Phone,
  },
  {
    name: "support@nerbixa.com",
    icon: Mail,
  },
  {
    name: `Dept 6162 43 Owston Road, Carcroft, Doncaster, United Kingdom, DN6 8DA`,
    icon: MapPin,
  },
];

const Footer = () => {
  const date = new Date();
  let year = date.getFullYear();

  return (
    <footer className="main-footer w-full bg-white">
      <div className="main-footer__top max-w-[1350px] mx-auto">
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="pr-4 pl-4">
              <div className="footer-widget__column footer-widget__about">
                <div className="footer-widget__logo">
                  <Image width={"98"} height={"39"} src="/logos/nerbixa-logo.png" alt="Nerbixa Logo" />
                </div>
                <p 
                  className="footer-widget__about-text"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: '0.01em',
                    textTransform: 'none',
                    color: '#0f172a'
                  }}
                >
                  Power your vision with a next-gen AI hub that unlocks endless creativity across words, images, music, videos and beyond
                </p>
              </div>
            </div>

            <div className="pr-4 pl-4 pt-6 md:pt-0">
              <div className="footer-widget__column footer-widget__company">
                <div className="footer-widget__title-box">
                  <h3 
                    className="footer-widget__title"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                      color: '#0f172a'
                    }}
                  >Menu</h3>
                </div>
                <div className="footer-widget__resources-list-box">
                  <ul className="footer-widget__resources-list">
                    {routes.map((route) => (
                      <li key={route.name}>
                        <Link 
                          href={route.href}
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            textTransform: 'none',
                            color: '#0f172a'
                          }}
                        >{route.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="pr-4 pl-4 pt-6 xl:pt-0">
              <div className="footer-widget__column footer-widget__resources">
                <div className="footer-widget__title-box">
                  <h3 
                    className="footer-widget__title"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                      color: '#0f172a'
                    }}
                  >Links</h3>
                </div>
                <div className="footer-widget__resources-list-box">
                  <ul className="footer-widget__resources-list">
                    {importantLinks.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href}
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            textTransform: 'none',
                            color: '#0f172a'
                          }}
                        >{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <a
                      href="https://www.instagram.com/nerbixa.ai?igsh=aGx1aDBjZnFoMjU0"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      title="Instagram"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      tabIndex={0}
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="pr-4 pl-4 pt-6 xl:pt-0">
              <div className="footer-widget__column footer-widget__resources">
                <div className="footer-widget__title-box">
                  <h3 
                    className="footer-widget__title"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                      color: '#0f172a'
                    }}
                  >Company</h3>
                </div>
                <div className="footer-widget__company-list-box">
                  <ul className="space-y-4">
                    {companyDetails.map((detail) => (
                      <li 
                        key={detail.name} 
                        className="flex text-sm"
                        style={{
                          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          letterSpacing: '0.01em',
                          textTransform: 'none',
                          color: '#0f172a'
                        }}
                      >
                        <detail.icon className="h-5 w-5 mr-3 min-w-fit" />
                        {detail.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="main-footer__bottom max-w-[1350px] mx-auto">
        <div className="flex justify-between items-center px-4 mx-4">
          <div className="">
            <p 
              className="text-center"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '0.01em',
                textTransform: 'none',
                color: '#0f172a'
              }}
            >
              Nerbixa, Copyright © {year}. All Rights Reserved.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Image
            src="/cards.svg"
            alt="cards"
            width={300}
            height={100}
            className=""
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
