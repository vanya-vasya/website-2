"use client";

import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import { FeatureContainer } from "@/components/feature-container";
import { inputStyles, buttonStyles, contentStyles, loadingStyles, cardStyles } from "@/components/ui/feature-styles";
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

// Конфигурация для разных типов инструментов
const toolConfigs = {
  'video-generation': {
    title: 'Video Generation',
    description: `Turn your prompt into video. Generation can take from 1 to 5 minutes\nPrice: ${MODEL_GENERATIONS_PRICE.videoGeneration} credits`,
    iconName: 'FileVideo2',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-600/10',
    placeholder: 'Clown fish swimming in a coral reef'
  },
  'video-creation': {
    title: 'Video Maker',
    description: `Turn ideas and scripts into engaging video content automatically\nPrice: ${MODEL_GENERATIONS_PRICE.videoGeneration} credits`,
    iconName: 'Video',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    placeholder: 'A cinematic aerial view of a futuristic city at sunset'
  }
};

const VideoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolId = searchParams.get('toolId') || 'video-generation';
  const proModal = useProModal();
  const [video, setVideo] = useState<string>();

  // Получаем конфигурацию для текущего инструмента
  const currentTool = toolConfigs[toolId as keyof typeof toolConfigs] || toolConfigs['video-generation'];

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
      setVideo(undefined);
      const response = await axios.post("/api/video", values);
      setVideo(response.data);
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="bg-white">
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
              Generate
            </Button>
          </form>
        </Form>
        <div className={contentStyles.section}>
          {isLoading && (
            <div className={loadingStyles.container}>
              <Loader />
            </div>
          )}
          {!video && !isLoading && <Empty label="No results yet" />}
          {video && (
            <video
              controls
              className={cn(cardStyles.base, "w-full aspect-video")}
            >
              <source src={video} />
            </video>
          )}
        </div>
      </div>
    </FeatureContainer>
    </div>
  );
};

export default VideoPage;
