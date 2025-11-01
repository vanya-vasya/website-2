export const inputStyles = {
  base: "border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent focus:outline-none focus:border-0 focus:shadow-none focus-within:outline-none focus-within:ring-0 focus-within:border-0 text-black font-medium bg-transparent",
  container: "rounded-lg border border-gray-300 w-full p-4 px-3 md:px-6 bg-gray-100",
};

export const buttonStyles = {
  base: "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-white shadow-md hover:shadow-indigo-500/30 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
};

export const cardStyles = {
  base: "rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300",
  interactive: "cursor-poiter hover:scale-[1.02] active:scale-[0.98]",
};

export const contentStyles = {
  base: "px-4 lg:px-8 space-y-4",
  section: "space-y-4 mt-4",
};

export const messageStyles = {
  container: "p-4 lg:p-8 w-full flex items-start gap-x-4 lg:gap-x-8 rounded-lg",
  user: "bg-accent",
  assistant: "bg-accent/50",
};

export const loadingStyles = {
  container: "p-8 rounded-lg w-full flex items-center justify-center bg-accent/50",
}; 