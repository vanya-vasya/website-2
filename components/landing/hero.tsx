import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  const timeline = [
    {
      name: "Sign in",
      description:
        "Access your Creator Studio account quickly and securely. Start bringing your creative visions to life.",
      date: "1",
      dateTime: "2021-08",
    },
    {
      name: "Choose your creative profession",
      description:
        "Select from Video Creator, Digital Artist, Musician, or Content Creator to access specialized tools.",
      date: "2",
      dateTime: "2021-12",
    },
    {
      name: "Describe your creative vision",
      description:
        "Tell us what you want to create - whether it's a video script, concept art, song lyrics, or social media content.",
      date: "3",
      dateTime: "2022-02",
    },
    {
      name: "Generate professional creative content instantly",
      description:
        "From video scripts to album covers, animations to social graphics - create professional content in seconds.",
      date: "4",
      dateTime: "2022-12",
    },
  ];
  return (
    <section id="home" className="feature-one animate__flip pb-16 bg-slate-900">
      <div className="mx-auto px-2 sm:px-4">
        <div className="feature-one__color-overly-1 flaot-bob-y top-[-150px]"></div>
        <div className="feature-one__inner">
          <h2 className="feature-one__title font-semibold">
            AI-Powered Platform for <br />
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 inline">
              Creative Professionals
            </p>
          </h2>
          <div className="flex justify-center mb-12">
            <p className="max-w-4xl">
              Neuvisia is your creative AI assistant — a powerful platform
              designed specifically for video creators, digital artists,
              musicians, and content creators. Transform concepts into stunning
              videos, artwork, music, and content with specialized tools for
              your creative profession.
            </p>
          </div>
          <div className="feature-one__btn-box">
            <Link
              href="/dashboard"
              className="thm-btn feature-one__btn bg-slate-800 border border-slate-800 text-white transition duration-200"
            >
              <i className="fal fa-plus"></i> Access Creator Studio
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0 text-white flex justify-center">
          Elevate your creative process in four simple steps
        </h1>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4 mt-6">
          {timeline.map((item) => (
            <div key={item.name}>
              <time
                dateTime={item.dateTime}
                className="flex items-center text-sm font-semibold leading-6 text-white-300/10"
              >
                <svg
                  viewBox="0 0 4 4"
                  className="mr-4 h-1 w-1 flex-none"
                  aria-hidden="true"
                >
                  <circle cx={2} cy={2} r={2} fill="#db2777" />
                </svg>
                {item.date}
                <div
                  className="absolute -ml-2 h-px w-screen -translate-x-full bg-pink-600 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:translate-x-0"
                  aria-hidden="true"
                />
              </time>
              <p className="mt-6 text-lg font-semibold leading-8 tracking-tight text-white-300/10">
                {item.name}
              </p>
              <p className="mt-1 text-base leading-7 text-white-300/10">
                {item.description}
              </p>
            </div>
          ))}
          <div className="feature-one__color-overly-2 float-bob-x top-[50px] right-[30px]"></div>
        </div>
      </div>
      <div className="feature-one__color-overly-3 img-bounce absolute top-[300px] left-[250px]"></div>
    </section>
  );
};

export default Hero;
