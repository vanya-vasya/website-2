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
    label: "Video Creators",
    bgColor: "bg-violet-900/20",
    borderColor: "border-violet-500/20",
    textColor: "text-violet-400",
    iconColor: "text-violet-400",
    icon: FileVideo2,
  },
  {
    id: "art",
    label: "Digital Artists",
    bgColor: "bg-pink-900/20",
    borderColor: "border-pink-500/20",
    textColor: "text-pink-400",
    iconColor: "text-pink-400",
    icon: BrushIcon,
  },
  {
    id: "music",
    label: "Musicians",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400",
    iconColor: "text-blue-400",
    icon: FileAudio,
  },
  {
    id: "content",
    label: "Content Creators",
    bgColor: "bg-emerald-900/20",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400",
    iconColor: "text-emerald-400",
    icon: PaintBucket,
  },
];

export const tools = [
  // Базовые инструменты
  // Базовые инструменты
  {
    id: "chat-assistant",
    label: "Chat Assistant",
    icon: MessageSquare,
    description:
      "AI assistant to brainstorm content ideas and help with creator's block",
    href: "/dashboard/conversation",
    color: "text-red-600",
    bgColor: "bg-red-600/10",
    professions: ["all"],
  },
  {
    id: "image-generation",
    label: "Image Generation",
    icon: Image,
    description:
      "Generate custom imagery for your blogs, videos, and social media",
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
      "Enhance low-quality images and restore old photographs for your content",
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
      "Expand your images for different platforms with AI-powered content filling",
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
      "Change colors of objects to match your brand style and visual identity",
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
      "Clean up your photos by removing unwanted elements and distractions",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    href: "/dashboard/image-object-remove",
    professions: ["all"],
  },
  {
    id: "video-generation",
    label: "Video Generation",
    icon: FileVideo2,
    description:
      "Create engaging short-form video content for your social channels",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
    href: "/dashboard/video",
    professions: ["all"],
  },
  {
    id: "music-generation",
    label: "Music Generation",
    icon: Music,
    description: "Produce custom background music for your videos and podcasts",
    href: "/dashboard/music",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    professions: ["all"],
  },
  {
    id: "speech-generation",
    label: "Speech Generation",
    icon: Mic,
    description:
      "Create professional voiceovers and narrations for your videos",
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-600/10",
    href: "/dashboard/speech",
    professions: ["all"],
  },

  // Video Creators
  {
    id: "video-script",
    label: "Create Video Scenario/Script",
    icon: FileText,
    description:
      "Generate professional scripts and storyboards for your videos",
    color: "text-violet-600",
    bgColor: "bg-violet-600/10",
    href: "/dashboard/conversation",
    professions: ["video"],
  },
  {
    id: "video-creation",
    label: "Video Creation",
    icon: PlayCircle,
    description: "Generate engaging video content from your ideas and scripts",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    href: "/dashboard/video",
    professions: ["video"],
  },
  {
    id: "video-voiceover",
    label: "Video Voiceover Creation",
    icon: Megaphone,
    description: "Create professional narration and voiceovers for your videos",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/dashboard/speech",
    professions: ["video"],
  },

  // Digital Artists
  {
    id: "concept-art",
    label: "Concept Art Generator",
    icon: Palette,
    description:
      "Create stunning concept art and illustrations for your projects",
    color: "text-pink-600",
    bgColor: "bg-pink-600/10",
    href: "/dashboard/image-generation",
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
    label: "Digital Painting Enhancement",
    icon: BrushIcon,
    description: "Enhance and refine your digital paintings with AI assistance",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    href: "/dashboard/digital-painting-enhancement",
    professions: ["art"],
  },
  {
    id: "canvas-expansion",
    label: "Canvas Expansion",
    icon: LayoutGrid,
    description:
      "Seamlessly expand your artworks beyond their original boundaries",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    href: "/dashboard/canvas-expansion",
    professions: ["art"],
  },
  {
    id: "art-reference",
    label: "Art Reference Cleanup",
    icon: ImageMinus,
    description:
      "Clean up and prepare reference images for your artistic creations",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/dashboard/art-reference-cleanup",
    professions: ["art"],
  },

  // Musicians
  {
    id: "song-lyrics",
    label: "Write Song Lyrics",
    icon: FileText,
    description: "Generate creative and inspiring lyrics for your music",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    href: "/dashboard/conversation",
    professions: ["music"],
  },
  {
    id: "album-cover",
    label: "Album Cover Creator",
    icon: Image,
    description: "Design professional album covers and music artwork",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
    href: "/dashboard/image-generation",
    professions: ["music"],
  },
  {
    id: "music-composition",
    label: "Music Composition Assistant",
    icon: Music,
    description:
      "Get help composing melodies, chord progressions, and arrangements",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/dashboard/music",
    professions: ["music"],
  },
  {
    id: "sound-effects",
    label: "Sound Effect Generator",
    icon: FileAudio,
    description:
      "Create unique sound effects for your music tracks and productions",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    href: "/dashboard/music",
    professions: ["music"],
  },
  {
    id: "voice-melody",
    label: "Voice Melody Creator",
    icon: Mic,
    description:
      "Generate vocal melodies and harmonies for your musical compositions",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    href: "/dashboard/speech",
    professions: ["music"],
  },

  // Content Creators
  {
    id: "blog-ideas",
    label: "Blog Post Ideas",
    icon: BookOpen,
    description: "Generate engaging blog topics and outlines for your audience",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
    href: "/dashboard/conversation",
    professions: ["content"],
  },
  {
    id: "social-graphics",
    label: "Social Media Graphics",
    icon: Image,
    description: "Create eye-catching graphics for your social media platforms",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    href: "/dashboard/image-generation",
    professions: ["content"],
  },
  {
    id: "content-calendar",
    label: "Content Calendar Planner",
    icon: Calendar,
    description:
      "Plan and organize your content schedule for maximum engagement",
    color: "text-teal-600",
    bgColor: "bg-teal-600/10",
    href: "/dashboard/conversation",
    professions: ["content"],
  },
  {
    id: "thumbnail-optimizer",
    label: "Thumbnail Optimizer",
    icon: Image,
    description:
      "Create attention-grabbing thumbnails that increase your click-through rates",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/dashboard/thumbnail-optimizer",
    professions: ["content"],
  },
  {
    id: "caption-generator",
    label: "Caption Generator",
    icon: Type,
    description:
      "Generate compelling captions that drive engagement for your posts",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    href: "/dashboard/conversation",
    professions: ["content"],
  },
];

export const toolsModal = [
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/dashboard/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Images",
    icon: Image,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/dashboard/image-generation",
  },
  {
    label: "Video Generation",
    icon: FileVideo2,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/dashboard/video",
  },
  {
    label: "Music Generation",
    icon: Music,
    href: "/dashboard/music",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Speech Generation",
    icon: Mic,
    color: "text-cyan-600",
    bgColor: "bg-cyan-600/10",
    href: "/dashboard/speech",
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
