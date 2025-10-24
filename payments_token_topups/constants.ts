import {
  Code,
  FileText,
  LucideIcon,
  Image,
  MessageSquare,
  PlayCircle,
  Mic,


  PaintBucket,
  ArchiveRestore,
  ImageMinus,
  BrushIcon,
  Scissors,

  Layers,
  Pencil,
  Music,
  BookOpen,

  Megaphone,
  Book,
  Wand2,

  LayoutGrid,
  Clapperboard,


  Paintbrush,
  Expand,

  Disc,

  Lightbulb,
  Share2,

  Crown,
  Sparkles,
  Zap,
  Star,
  Diamond,
  Award,

} from "lucide-react";

interface ToolModal {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

export const GENERATIONS_PRICE = 0.20;

export const MODEL_GENERATIONS_PRICE = {
  conversation: 1,
  imageGeneration: 14,
  imageBackgroundRemoval: 17,
  imageGenerativeFill: 20,
  imageObjectRecolor: 16,
  imageObjectRemove: 28,
  imageRestore: 11,

  musicGeneration: 11,
  speecGeneration: 13,
  codeGeneration: 5,
};

// Определение типов профессий для фильтров
export type Profession = "video" | "art" | "content" | "all";

export const professions = [];

export const tools = [
  // Базовые инструменты
  // Базовые инструменты
  {
    id: "chat-assistant",
    label: "Chat Assistant",
    icon: Zap,
    description:
      "An AI assistant that sparks content ideas and helps you overcome creative block",
    href: "/dashboard/conversation",
    color: "text-red-600",
    bgColor: "bg-red-600/10",
    professions: ["all"],
  },
  {
    id: "image-generation",
    label: "Image Generation",
    icon: Sparkles,
    description:
      "Generate custom visuals for blogs, videos, and social media with a single prompt",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/dashboard/image-generation",
    professions: ["all"],
  },
  {
    id: "image-restore",
    label: "Image Restore",
    icon: ArchiveRestore,
    description:
      "Enhance low-quality images and bring old photographs back to life",
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/10",
    href: "/dashboard/image-restore",
    professions: ["all"],
  },
  {
    id: "image-background-removal",
    label: "Image Background Removal",
    icon: ImageMinus,
    description:
      "Create clean, professional product shots with automatic background removal",
    color: "text-lime-600",
    bgColor: "bg-lime-600/10",
    href: "/dashboard/image-background-removal",
    professions: ["all"],
  },
  {
    id: "image-generative-fill",
    label: "Image Generative Fill",
    icon: Layers,
    description:
      "Expand images for any platform with AI-powered content fill",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
    href: "/dashboard/image-generative-fill",
    professions: ["all"],
  },
  {
    id: "image-object-recolor",
    label: "Image Object Recolor",
    icon: PaintBucket,
    description:
      "Recolor objects to match your brand’s palette and visual identity",
    color: "text-cyan-600",
    bgColor: "bg-cyan-600/10",
    href: "/dashboard/image-object-recolor",
    professions: ["all"],
  },
  {
    id: "image-object-remove",
    label: "Image Object Remove",
    icon: Scissors,
    description:
      "Clean up photos by removing unwanted elements and distractions",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    href: "/dashboard/image-object-remove",
    professions: ["all"],
  },

  {
    id: "music-generation",
    label: "Music Generation",
    icon: Disc,
    description: "Produce custom background music for videos and podcasts in minutes",
    href: "/dashboard/music",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    professions: ["all"],
  },
  {
    id: "speech-generation",
    label: "Speech Generation",
    icon: Award,
    description:
      "Create professional voiceovers and narration for your videos",
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-600/10",
    href: "/dashboard/speech",
    professions: ["all"],
  },

  // Co-Directors
  {
    id: "video-script",
    label: "Script Builder",
    icon: Clapperboard,
    description:
      "Generate industry-ready scripts and storyboards for your videos",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
    bgColor: "bg-violet-600/10",
    href: "https://yum-mi.com/dashboard/conversation?toolId=video-script",
    professions: ["video"],
  },




  // {
  //   id: "art-style-transfer",
  //   label: "Art Style Transfer",
  //   icon: Wand2,
  //   description:
  //     "Transform your artworks with different artistic styles and techniques",
  //   color: "text-rose-600",
  //   bgColor: "bg-rose-600/10",
  //   href: "/dashboard/art-style-transfer",
  //   professions: ["art"],
  // },











  // Content Creators

  {
    id: "social-graphics",
    label: "Social Graphics",
    icon: Share2,
    description: "Create eye-catching graphics optimized for every social platform",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    href: "https://yum-mi.com/dashboard/image-generation?toolId=social-graphics",
    professions: ["content"],
  },



];

export const toolsModal: ToolModal[] = [];

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
    subTitle: "Enhance an image&apos;s dimensions using AI outpainting",
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
  "4:3": {
    aspectRatio: "4:3",
    label: "Standard (4:3)",
    width: 1000,
    height: 750,
  },
  "16:9": {
    aspectRatio: "16:9",
    label: "Widescreen (16:9)",
    width: 1000,
    height: 563,
  },
  "3:2": {
    aspectRatio: "3:2",
    label: "Photo (3:2)",
    width: 1000,
    height: 667,
  },
  "5:4": {
    aspectRatio: "5:4",
    label: "Print (5:4)",
    width: 1000,
    height: 800,
  },
  "2:1": {
    aspectRatio: "2:1",
    label: "Panorama (2:1)",
    width: 1000,
    height: 500,
  },
  "21:9": {
    aspectRatio: "21:9",
    label: "Ultra-Widescreen (21:9)",
    width: 1000,
    height: 429,
  },
  "2:3": {
    aspectRatio: "2:3",
    label: "Portrait (2:3)",
    width: 1000,
    height: 1500,
  },
  "5:7": {
    aspectRatio: "5:7",
    label: "Classic (5:7)",
    width: 1000,
    height: 1400,
  },
  "16:10": {
    aspectRatio: "16:10",
    label: "Widescreen (16:10)",
    width: 1000,
    height: 625,
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


