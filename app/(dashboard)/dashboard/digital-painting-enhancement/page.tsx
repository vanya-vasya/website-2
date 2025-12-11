"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/ui/empty";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { useProModal } from "@/hooks/use-pro-modal";
import { FeatureContainer } from "@/components/feature-container";
import { inputStyles, buttonStyles, contentStyles, messageStyles, loadingStyles } from "@/components/ui/feature-styles";

import { formSchema } from "./constants";
import { MODEL_GENERATIONS_PRICE } from "@/constants";
import { useTranslations } from "next-intl";

// Define ChatCompletionRequestMessage type locally
type ChatCompletionRequestMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

const PaintingEnhancePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolId = searchParams.get('toolId') || 'digital-painting';
  const proModal = useProModal();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const t = useTranslations();

  // Configuration for different painting enhancement tools
  const paintingToolConfigs = {
    'digital-painting': {
      title: t("dashboardTools.paintingEnhance.title"),
      description: `${t("dashboardTools.paintingEnhance.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.paintingEnhance.priceLabel")}`,
      iconName: 'Paintbrush' as const,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      placeholder: t("dashboardTools.paintingEnhance.placeholder", { defaultValue: "Enhance this digital painting with better colors, lighting, and details..." })
    },
    'style-enhancement': {
      title: t("dashboardTools.paintingEnhance.title"),
      description: `${t("dashboardTools.paintingEnhance.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.paintingEnhance.priceLabel")}`,
      iconName: 'Paintbrush' as const,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-600/10',
      placeholder: t("dashboardTools.paintingEnhance.placeholder", { defaultValue: "Transform your artwork by applying dramatic lighting effects and cinematic color grading..." })
    },
    'color-correction': {
      title: 'Color Correction',
      description: `Perfect color balance and harmony in your digital paintings\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} credits`,
      iconName: 'Palette' as const,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
      placeholder: 'Adjust the color temperature and increase saturation to make this sunset painting more dramatic...'
    },
    'detail-enhancement': {
      title: 'Detail Enhancement',
      description: `Add intricate details and improve resolution of your artwork\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} credits`,
      iconName: 'Focus' as const,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      placeholder: 'Add fine details to the character face and enhance the texture of the clothing...'
    },
    'composition-advice': {
      title: 'Composition Advisor',
      description: `Get expert advice on improving your painting's composition and visual flow\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} credits`,
      iconName: 'LayoutGrid' as const,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
      placeholder: 'Analyze this landscape painting and suggest improvements to the composition and focal points...'
    },
    'lighting-enhancement': {
      title: 'Lighting Enhancement',
      description: `Improve lighting, shadows, and atmospheric effects in your paintings\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} credits`,
      iconName: 'Lightbulb' as const,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-600/10',
      placeholder: 'Enhance the dramatic lighting in this portrait and add more realistic shadows...'
    },
    'texture-improvement': {
      title: 'Texture Improvement',
      description: `Add realistic textures and surface details to your digital paintings\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} credits`,
      iconName: 'Layers' as const,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-600/10',
      placeholder: 'Improve the texture of the stone walls and add weathering effects to this castle painting...'
    },
  };

  // Get configuration for current tool
  const currentTool = paintingToolConfigs[toolId as keyof typeof paintingToolConfigs] || paintingToolConfigs['digital-painting'];
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Update placeholder when toolId changes
  useEffect(() => {
    form.reset({ prompt: "" });
  }, [toolId, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });
      setMessages((current) => [...current, userMessage, response.data]);

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error(t("dashboardTools.error"));
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <FeatureContainer
      title={currentTool.title}
      description={currentTool.description}
      iconName={currentTool.iconName as keyof typeof import("lucide-react")}
    >
      <div className={contentStyles.base}>


        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              inputStyles.container,
              "grid grid-cols-12 gap-2"
            )}
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className={inputStyles.base}
                      disabled={isLoading}
                      placeholder={currentTool.placeholder}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className={cn(
                buttonStyles.base,
                "col-span-12 lg:col-span-2 w-full"
              )}
              type="submit"
              disabled={isLoading}
              size="icon"
            >
              {isLoading ? t("dashboardTools.generating") : t("dashboardTools.generate")}
            </Button>
          </form>
        </Form>
        
        <div className={contentStyles.section}>
          {isLoading && (
            <div className={loadingStyles.container}>
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label={t("dashboardTools.noResults")} />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message) => (
              <div
                key={message.content}
                className={cn(
                  messageStyles.container,
                  message.role === "user"
                    ? messageStyles.user
                    : messageStyles.assistant
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </FeatureContainer>
  );
};

export default PaintingEnhancePage;