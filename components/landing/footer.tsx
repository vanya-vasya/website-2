import { Building, FileText, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const routes = [
  {
    name: "Home",
    href: "/#home",
  },
  {
    name: "Features",
    href: "/#features",
  },
  {
    name: "FAQ",
    href: "/#faq",
  },
  {
    name: "Solutions",
    href: "/#solutions",
  },
  {
    name: "Testimonials",
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
    name: "Company: GROWTHPIXEL LTD",
    icon: Building,
  },
  {
    name: "Company Number: 16385052",
    icon: FileText,
  },
  {
    name: "support@neuvisia.com",
    icon: Mail,
  },
  {
    name: `128 City Road, London, United Kingdom, EC1V 2NX`,
    icon: MapPin,
  },
];

const Footer = () => {
  const date = new Date();
  let year = date.getFullYear();

  return (
    <footer className="main-footer max-w-[1350px] mx-auto bg-slate-900">
      <div className="main-footer__shape-1 img-bounce"></div>
      <div className="main-footer__top">
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="pr-4 pl-4">
              <div className="footer-widget__column footer-widget__about">
                <div className="footer-widget__logo">
                  <Image width={"150"} height={"60"} src="/logo.png" alt="" />
                </div>
                <p className="footer-widget__about-text">
                  Unleash Your Creativity with Neuvisia – Your All-in-One
                  Generative AI Platform. Discover limitless possibilities and
                  bring your ideas to life effortlessly with cutting-edge AI
                  tools for text, images, music, video, code, and more.
                </p>
              </div>
            </div>

            <div className="pr-4 pl-4 pt-6 md:pt-0">
              <div className="footer-widget__column footer-widget__company">
                <div className="footer-widget__title-box">
                  <h3 className="footer-widget__title">Menu</h3>
                </div>
                <div className="footer-widget__resources-list-box">
                  <ul className="footer-widget__resources-list">
                    {routes.map((route) => (
                      <li key={route.name}>
                        <Link href={route.href}>{route.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="pr-4 pl-4 pt-6 xl:pt-0">
              <div className="footer-widget__column footer-widget__resources">
                <div className="footer-widget__title-box">
                  <h3 className="footer-widget__title">Links</h3>
                </div>
                <div className="footer-widget__resources-list-box">
                  <ul className="footer-widget__resources-list">
                    {importantLinks.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href}>{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="pr-4 pl-4 pt-6 xl:pt-0">
              <div className="footer-widget__column footer-widget__resources">
                <div className="footer-widget__title-box">
                  <h3 className="footer-widget__title">Company</h3>
                </div>
                <div className="footer-widget__company-list-box">
                  <ul className="space-y-4">
                    {companyDetails.map((detail) => (
                      <li key={detail.name} className="flex text-sm">
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
      <div className="main-footer__bottom">
        <div className="flex justify-between items-center px-4 mx-4">
          <div className="">
            <p className="text-center">
              Neuvisia, Copyright © {year}. All Rights Reserved.
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
