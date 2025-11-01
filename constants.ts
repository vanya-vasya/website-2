import {
  Code,
  FileText,
  LucideIcon,
  Image,
  MessageSquare,
  PlayCircle,
  Mic,
  FileAudio,
  FileVideo2,
  PaintBucket,
  ArchiveRestore,
  ImageMinus,
  BrushIcon,
  Scissors,
  Palette,
  Layers,
  Pencil,
  Music,
  BookOpen,
  Calendar,
  Megaphone,
  Book,
  Wand2,
  Type,
  LayoutGrid,
  Clapperboard,
  Video,
  Mic2,
  Paintbrush,
  Expand,
  Eraser,
  Disc,
  Volume2,
  Lightbulb,
  Share2,
  Focus,
  Crown,
  Sparkles,
  Zap,
  Star,
  Diamond,
  Award,
  Gem,
} from "lucide-react";

export const GENERATIONS_PRICE = 0.05;

export const MODEL_GENERATIONS_PRICE = {
  conversation: 1,
  imageGeneration: 14,
  imageBackgroundRemoval: 17,
  imageGenerativeFill: 20,
  imageObjectRecolor: 16,
  imageObjectRemove: 28,
  imageRestore: 11,
  videoGeneration: 20,
  musicGeneration: 11,
  speecGeneration: 13,
  codeGeneration: 5,
};

// Определение типов профессий для фильтров
export type Profession = "video" | "art" | "music" | "content" | "all";

export const professions = [
  {
    id: "video",
    label: "Co-Director",
    bgColor: "bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-600",
    borderColor: "border-transparent",
    textColor: "text-white",
    iconColor: "text-white",
    icon: Crown,
  },
  {
    id: "art",
    label: "Design Partner",
    bgColor: "bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-600",
    borderColor: "border-transparent",
    textColor: "text-white",
    iconColor: "text-white",
    icon: Sparkles,
  },
  {
    id: "music",
    label: "Co-Composer",
    bgColor: "bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-600",
    borderColor: "border-transparent",
    textColor: "text-white",
    iconColor: "text-white",
    icon: Disc,
  },
  {
    id: "content",
    label: "Creative Partner",
    bgColor: "bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-600",
    borderColor: "border-transparent",
    textColor: "text-white",
    iconColor: "text-white",
    icon: Diamond,
  },
];

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
    icon: Palette,
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
    id: "video-generation",
    label: "Video Generation",
    icon: Star,
    description:
      "Create engaging short-form videos tailored to your social channels",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
    href: "/dashboard/video",
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
    href: "https://nerbixa.com/dashboard/conversation?toolId=video-script",
    professions: ["video"],
  },
  {
    id: "video-creation",
    label: "Video Maker",
    icon: Video,
    description: "Turn ideas and scripts into engaging video content automatically",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    href: "https://nerbixa.com/dashboard/video?toolId=video-creation",
    professions: ["video"],
  },
  {
    id: "video-voiceover",
    label: "AI Voiceover",
    icon: Mic2,
    description: "Deliver broadcast-quality narration and voiceovers for every video",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "https://nerbixa.com/dashboard/speech?toolId=video-voiceover",
    professions: ["video"],
  },

  // Design Partners
  {
    id: "concept-art",
    label: "Design Partner",
    icon: Palette,
    description:
      "Create stunning concept art and illustrations for your projects",
    color: "text-pink-600",
    bgColor: "bg-pink-600/10",
    href: "https://nerbixa.com/dashboard/image-generation?toolId=concept-art",
    professions: ["art"],
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
  {
    id: "digital-painting",
    label: "Painting Enhance",
    icon: Paintbrush,
    description: "Enhance and refine your digital paintings with AI-powered artistic improvements",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    href: "https://nerbixa.com/dashboard/digital-painting-enhancement?toolId=digital-painting",
    professions: ["art"],
  },
  {
    id: "canvas-expansion",
    label: "Canvas Expand",
    icon: Expand,
    description:
      "Generate engaging blog topics and clear outlines for your audience",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    href: "https://nerbixa.com/dashboard/canvas-expansion?toolId=canvas-expansion",
    professions: ["art"],
  },
  {
    id: "art-reference",
    label: "Reference Cleanup",
    icon: Eraser,
    description:
      "Clean up and prepare reference images for your artistic creations",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "https://nerbixa.com/dashboard/art-reference-cleanup?toolId=art-reference",
    professions: ["art"],
  },

  // Co-Composers
  {
    id: "song-lyrics",
    label: "Lyric Writer",
    icon: FileAudio,
    description: "Generate creative and inspiring lyrics for your music",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    href: "https://nerbixa.com/dashboard/conversation?toolId=song-lyrics",
    professions: ["music"],
  },
  {
    id: "album-cover",
    label: "Cover Art",
    icon: Disc,
    description: "Design professional album covers and music artwork",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
    href: "https://nerbixa.com/dashboard/image-generation?toolId=album-cover",
    professions: ["music"],
  },
  {
    id: "music-composition",
    label: "Compose Assist",
    icon: Music,
    description:
      "Get AI assistance composing melodies, chord progressions, and full arrangements",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "https://nerbixa.com/dashboard/music?toolId=music-composition",
    professions: ["music"],
  },
  {
    id: "sound-effects",
    label: "SFX Generator",
    icon: Volume2,
    description:
      "Create unique sound effects for your music tracks and productions",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    href: "https://nerbixa.com/dashboard/music?toolId=sound-effects",
    professions: ["music"],
  },
  {
    id: "voice-melody",
    label: "Melody Maker",
    icon: Mic,
    description:
      "Generate vocal melodies and harmonies for your musical compositions",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    href: "https://nerbixa.com/dashboard/speech?toolId=voice-melody",
    professions: ["music"],
  },

  // Content Creators
  {
    id: "blog-ideas",
    label: "Blog Ideas",
    icon: Gem,
    description: "Generate engaging blog topics and clear outlines for your audience",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
    href: "https://nerbixa.com/dashboard/conversation?toolId=blog-ideas",
    professions: ["content"],
  },
  {
    id: "social-graphics",
    label: "Social Graphics",
    icon: Share2,
    description: "Create eye-catching graphics optimized for every social platform",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    href: "https://nerbixa.com/dashboard/image-generation?toolId=social-graphics",
    professions: ["content"],
  },
  {
    id: "content-calendar",
    label: "Content Planner",
    icon: Calendar,
    description:
      "Plan and organize your content schedule to maximize engagement",
    color: "text-teal-600",
    bgColor: "bg-teal-600/10",
    href: "https://nerbixa.com/dashboard/conversation?toolId=content-calendar",
    professions: ["content"],
  },
  {
    id: "thumbnail-optimizer",
    label: "Thumbnail Optimizer",
    icon: Focus,
    description:
      "Design attention-grabbing thumbnails that lift click-through rates",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "https://nerbixa.com/dashboard/thumbnail-optimizer?toolId=thumbnail-optimizer",
    professions: ["content"],
  },
  {
    id: "caption-generator",
    label: "Caption Generator",
    icon: Type,
    description:
      "Write compelling captions that drive measurable engagement",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    href: "https://nerbixa.com/dashboard/conversation?toolId=caption-generator",
    professions: ["content"],
  },
];

export const toolsModal = [
  {
    label: "Co-Director",
    icon: Crown,
    href: "/dashboard/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Design Partner",
    icon: Sparkles,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/dashboard/image-generation",
  },
  {
    label: "Co-Composer",
    icon: Disc,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/dashboard/video",
  },
  {
    label: "Creative Partner",
    icon: Diamond,
    href: "/dashboard/music",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
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


