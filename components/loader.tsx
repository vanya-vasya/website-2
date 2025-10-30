import Image from "next/image"

export const Loader = () => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center bg-white">
      <div className="w-10 h-10 relative animate-spin">
        <Image
          alt="Logo"
          src="/logos/nerbixa-icon.png"
          fill
        />
      </div>
      <p className="text-sm text-gray-700">
        Nerbixa is thinking...
      </p>
    </div>
  );
};