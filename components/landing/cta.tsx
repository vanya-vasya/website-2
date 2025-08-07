import Image from "next/image";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="free-trail">
      <div className="container mx-auto px-4">
        <div className="free-trail__wrap">
          <div
            className="free-trail__shape-3"
            style={{
              backgroundImage: "url(/images/shapes/free-trail-shape-3.png)",
            }}
          ></div>
          <div className="free-trail__shape-1 float-bob-x"></div>
          <div className="free-trail__start-1 zoominout">
            <Image
              width={"17"}
              height={"17"}
              src="/images/shapes/free-trail-start-1.png"
              alt=""
            />
          </div>
          <div className="free-trail__start-2 float-bob-y">
            <Image
              width={"17"}
              height={"17"}
              src="/images/shapes/free-trail-start-2.png"
              alt=""
            />
          </div>
          <div className="free-trail__start-3 float-bob-x">
            <Image
              width={"17"}
              height={"17"}
              src="/images/shapes/free-trail-start-3.png"
              alt=""
            />
          </div>
          <div className="free-trail__start-4 zoominout">
            <Image
              width={"17"}
              height={"17"}
              src="/images/shapes/free-trail-start-4.png"
              alt=""
            />
          </div>
          <div className="free-trail__inner">
            <div className="section-title text-center">
              <div className="section-title__tagline-box">
                <span className="section-title__tagline">
                  Free generation tokens
                </span>
              </div>
              <h2 className="section-title__title">
                Be part of the future of AI Horizon <br /> Let’s Create
                Something
              </h2>
            </div>
            <p className="free-trail__text">
              Unlock the power of AI and transform your creative process. Get
              started today with free generation tokens
              <br className="hidden lg:block" /> and discover how AI Horizon can
              elevate your work to new heights.
            </p>
            <div className="free-trail__btn-box">
              <Link href="/dashboard" className="thm-btn-two free-trail__btn">
                Get Started Free <i className="icon-up-right-arrow"></i>{" "}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
