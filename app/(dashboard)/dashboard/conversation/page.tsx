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
import { MODEL_GENERATIONS_PRICE, tools } from "@/constants";
import { useTranslations } from "next-intl";

// Define ChatCompletionRequestMessage type locally
type ChatCompletionRequestMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

const ConversationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolId = searchParams.get('toolId') || 'chat-assistant';
  const proModal = useProModal();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const t = useTranslations();

  // Конфигурация для разных типов инструментов
  const toolConfigs = {
    'chat-assistant': {
      title: t("dashboardTools.chatAssistant.title"),
      description: `${t("dashboardTools.chatAssistant.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.chatAssistant.priceLabel")}`,
      iconName: 'MessageSquare',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-600/10',
      placeholder: t("dashboardTools.chatAssistant.placeholder")
    },
    'video-script': {
      title: t("dashboardTools.scriptBuilder.title"),
      description: `${t("dashboardTools.scriptBuilder.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.scriptBuilder.priceLabel")}`,
      iconName: 'Clapperboard',
      iconColor: 'text-black',
      bgColor: 'bg-violet-600/10',
      placeholder: t("dashboardTools.scriptBuilder.placeholder")
    },
    'song-lyrics': {
      title: t("dashboardTools.songLyrics.title"),
      description: `${t("dashboardTools.songLyrics.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.songLyrics.priceLabel")}`,
      iconName: 'FileAudio',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      placeholder: t("dashboardTools.songLyrics.placeholder")
    },
    'blog-ideas': {
      title: t("dashboardTools.blogIdeas.title"),
      description: `${t("dashboardTools.blogIdeas.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.blogIdeas.priceLabel")}`,
      iconName: 'BookOpen',
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-600/10',
      placeholder: t("dashboardTools.blogIdeas.placeholder")
    },
    'content-calendar': {
      title: t("dashboardTools.contentCalendar.title"),
      description: `${t("dashboardTools.contentCalendar.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.contentCalendar.priceLabel")}`,
      iconName: 'Calendar',
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-600/10',
      placeholder: t("dashboardTools.contentCalendar.placeholder")
    },
    'caption-generator': {
      title: t("dashboardTools.captionGenerator.title"),
      description: `${t("dashboardTools.captionGenerator.description")}\n${t("common.price")}: ${MODEL_GENERATIONS_PRICE.conversation} ${t("dashboardTools.captionGenerator.priceLabel")}`,
      iconName: 'Type',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      placeholder: t("dashboardTools.captionGenerator.placeholder")
    },
  };

  // Получаем конфигурацию для текущего инструмента
  const currentTool = toolConfigs[toolId as keyof typeof toolConfigs] || toolConfigs['chat-assistant'];
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Обновляем placeholder при изменении toolId
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

export default ConversationPage;
