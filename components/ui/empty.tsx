import Image from "next/image";

interface EmptyProps {
  label: string;
}

export const Empty = ({
  label
}: EmptyProps) => {
  return (
    <div className="h-full p-20 flex flex-col gap-y-4 items-center justify-center">
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        <Image
          alt="No content"
          src="/logos/nerbixa-icon.png"
          fill
          className="opacity-50"
        />
      </div>
      <p className="text-lg font-medium bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent text-center">
        {label}
      </p>
    </div>
  );
};