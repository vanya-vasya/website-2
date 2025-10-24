import Image from "next/image"

export const Loader = () => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center bg-slate-900">
      <div className="w-10 h-10 relative animate-spin">
        <Image
          alt="Logo"
          src="/logo-icon.png"
          fill
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Nerbixa is thinking...
      </p>
    </div>
  );
};