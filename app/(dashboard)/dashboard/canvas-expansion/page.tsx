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

// Define ChatCompletionRequestMessage type locally
type ChatCompletionRequestMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

// Configuration for canvas expansion tool
const toolConfig = {
  title: 'Canvas Expand',
  description: `Generate engaging blog topics and clear outlines for your audience\nPrice: ${MODEL_GENERATIONS_PRICE.conversation} credits`,
  iconName: 'Expand',
  placeholder: 'Create a comprehensive blog post about sustainable living practices for urban millennials, including actionable tips and trending topics...'
};

const CanvasExpansionPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });



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
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <FeatureContainer
      title={toolConfig.title}
      description={toolConfig.description}
      iconName={toolConfig.iconName as keyof typeof import("lucide-react")}
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
                      placeholder={toolConfig.placeholder}
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
          {messages.length === 0 && !isLoading && (
            <Empty label="No results yet" />
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

export default CanvasExpansionPage;