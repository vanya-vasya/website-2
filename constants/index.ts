import {
  LucideIcon,
  MessageSquare,
  ImageIcon,
  VideoIcon,
  Music,
  Code,
  Settings,
  Sparkles,
} from "lucide-react";

export interface Tool {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  description?: string;
}

export const tools: Tool[] = [
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/dashboard/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description:
      "Chat with an advanced AI assistant that understands context and nuance.",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/dashboard/image-generation",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description:
      "Generate stunning images from text descriptions using state-of-the-art AI.",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    href: "/dashboard/video",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description:
      "Create engaging videos from text prompts with AI-powered animation.",
  },
  {
    label: "Music Generation",
    icon: Music,
    href: "/dashboard/music",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description:
      "Compose original music and melodies using AI composition models.",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/dashboard/code",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description:
      "Generate code snippets and get programming help from an AI expert.",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    description:
      "Customize your AI experience and manage your account preferences.",
  },
];

export const navLinks = [
  {
    label: "Home",
    route: "/",
    icon: "/assets/icons/home.svg",
  },
  {
    label: "Image Restore",
    route: "/transformations/add/restore",
    icon: "/assets/icons/image.svg",
  },
  {
    label: "Generative Fill",
    route: "/transformations/add/fill",
    icon: "/assets/icons/stars.svg",
  },
  {
    label: "Object Remove",
    route: "/transformations/add/remove",
    icon: "/assets/icons/scan.svg",
  },
  {
    label: "Object Recolor",
    route: "/transformations/add/recolor",
    icon: "/assets/icons/filter.svg",
  },
  {
    label: "Background Remove",
    route: "/transformations/add/removeBackground",
    icon: "/assets/icons/camera.svg",
  },
  {
    label: "Profile",
    route: "/profile",
    icon: "/assets/icons/profile.svg",
  },
  {
    label: "Buy Credits",
    route: "/credits",
    icon: "/assets/icons/bag.svg",
  },
];

export const transformationTypes = {
  restore: {
    type: "restore",
    title: "Restore Image",
    subTitle: "Refine images by removing noise and imperfections",
    config: { restore: true },
    icon: "image.svg",
  },
  removeBackground: {
    type: "removeBackground",
    title: "Background Remove",
    subTitle: "Removes the background of the image using AI",
    config: { removeBackground: true },
    icon: "camera.svg",
  },
  fill: {
    type: "fill",
    title: "Generative Fill",
    subTitle: "Enhance an image's dimensions using AI outpainting",
    config: { fillBackground: true },
    icon: "stars.svg",
  },
  remove: {
    type: "remove",
    title: "Object Remove",
    subTitle: "Identify and eliminate objects from images",
    config: {
      remove: { prompt: "", removeShadow: true, multiple: true },
    },
    icon: "scan.svg",
  },
  recolor: {
    type: "recolor",
    title: "Object Recolor",
    subTitle: "Identify and recolor objects from the image",
    config: {
      recolor: { prompt: "", to: "", multiple: true },
    },
    icon: "filter.svg",
  },
};

export const aspectRatioOptions = {
  "1:1": {
    aspectRatio: "1:1",
    label: "Square (1:1)",
    width: 1000,
    height: 1000,
  },
  "3:4": {
    aspectRatio: "3:4",
    label: "Standard Portrait (3:4)",
    width: 1000,
    height: 1334,
  },
  "9:16": {
    aspectRatio: "9:16",
    label: "Phone Portrait (9:16)",
    width: 1000,
    height: 1778,
  },
};

export const defaultValues = {
  title: "",
  aspectRatio: "",
  color: "",
  prompt: "",
  publicId: "",
};

export const creditFee = -1;

export type Currency =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "AED"
  | "SEK"
  | "PLN"
  | "CZK"
  | "DKK"
  | "NOK"
  | "RON"
  | "HUF"
  | "MDL"
  | "BGN"
  | "JOD"
  | "KWD";

export const currenciesRate: Record<Currency, number> = {
  EUR: 1,
  USD: 1.133616,
  GBP: 0.84,
  CHF: 0.94,
  AED: 4.19,
  SEK: 10.98,
  PLN: 4.27,
  CZK: 24.8,
  DKK: 7.46,
  NOK: 11.5,
  RON: 5.04,
  HUF: 401.8,
  MDL: 19.71,
  BGN: 1.96,
  JOD: 0.81,
  KWD: 0.346695,
};

export const currencies = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "AED",
  "SEK",
  "PLN",
  "CZK",
  "DKK",
  "NOK",
  "RON",
  "HUF",
  "MDL",
  "BGN",
  "JOD",
  "KWD",
] as const;

export const MODEL_GENERATIONS_PRICE = {
  conversation: 0.01,
  image_generation: 0.02,
  image_restore: 0.02,
  image_background_removal: 0.02,
  image_object_remove: 0.02,
  image_object_recolor: 0.02,
  image_generative_fill: 0.02,
  code: 0.01,
  music: 0.02,
  speech: 0.02,
  video: 0.05,
};

// NetworkX Pay Public Key for webhook signature verification
export const PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Hskkcbbus+LFkyD1NdJHu5ZcV2X/01b3jHhlA6vTFSPpNYnHq8Y3WEe7jrSc44PsR0kGibMjZJAB+S1vyZrI/c1OJKk0njXU59ofyRVR6fTkpytwIXqALweGKfWmmSxpJDJXGt+m0sQyG+UjYunHNY6Qw4ARO5+MWNT2GVpbuAEQ+sOksYWjUi9ftEhlcFeFGhO25/eqbV/QtnbqBXjZj3TsCUM1mQY/F9PhXj8Ku6T1vi/Av+Tf4dgyEsch57DTWZa7hMfp663UpaDLNk7Zd90nztYhjPrN9/AWrqyQQ9IKZHpco2iPLbqM8iloi4n5wSTIfWSVR8bZ1kWPhhoAQIDAQAB";