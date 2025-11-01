"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { aspectRatioOptions, transformationTypes } from "@/constants";
import { CustomField } from "./CustomField";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { useProModal } from "@/hooks/use-pro-modal";
import { inputStyles, buttonStyles } from "@/components/ui/feature-styles";
import { cn } from "@/lib/utils";
import axios from "axios";

export const baseSchema = z.object({
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const createSchema = (type: string) => {
  if (type === "recolor") {
    return baseSchema.extend({
      color: z
        .string({ required_error: "This field is required" })
        .min(1, "This field is required."),
      prompt: z
        .string({ required_error: "This field is required" })
        .min(1, "This field is required."),
    });
  } else if (type === "fill") {
    return baseSchema.extend({
      aspectRatio: z.string({ required_error: "This field is required" }),
    });
  } else if (type === "remove") {
    return baseSchema.extend({
      prompt: z
        .string({ required_error: "This field is required" })
        .min(1, "This field is required."),
    });
  }

  return baseSchema;
};

// Объявление типа для объекта image, который создается в MediaUploader
type UploadedImage = {
  publicId: string;
  width: number;
  height: number;
  secureURL: string;
  aspectRatio?: string;
};

const TransformationForm = ({
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
  generationPrice,
  useStyleTransfer = false,
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);

  const proModal = useProModal();

  // 1. Define your form.
  const formSchema = createSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    if (image) {
      setIsButtonDisabled(false);
    }
    const imageSize = aspectRatioOptions[value as AspectRatioKey];
    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    setNewTransformation(transformationType.config);

    return onChangeField(value);
  };

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    if (image) {
      setIsButtonDisabled(false);
    }
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));
    }, 200)();
    return onChangeField(value);
  };

  useEffect(() => {
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTransformation(transformationType.config);
    }
  }, [image, transformationType.config, type]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (creditBalance >= generationPrice) {
      setIsTransforming(true);
      setIsButtonDisabled(true);

      if (useStyleTransfer && image) {
        // Теперь типизация корректная
        const imageUrl = image.secureURL || '';
        
        if (imageUrl) {
          const stylePrompt = values.color || "";
          const objectPrompt = values.prompt || "";
          const combinedPrompt = `${objectPrompt} ${stylePrompt}`.trim();

          // Вызов нового API для генерации с GPT Image
          axios.post("/api/style-transfer", {
            imageUrl: imageUrl,
            prompt: combinedPrompt
          })
          .then((response) => {
            const generatedImageUrl = response.data[0]?.url;
            if (generatedImageUrl) {
              setTransformedImageUrl(generatedImageUrl);
            }
            setIsTransforming(false);
          })
          .catch((error) => {
            console.error("Style transfer error:", error);
            setIsTransforming(false);
            setIsButtonDisabled(false);
          });
        } else {
          console.error("No image URL available");
          setIsTransforming(false);
          setIsButtonDisabled(false);
        }
      } else {
        setTransformationConfig(
          deepMergeObjects(newTransformation, transformationConfig)
        );
      }
    } else {
      proModal.onOpen();
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        {type === "fill" && (
          <div className={cn(inputStyles.container, "grid grid-cols-12 gap-2")}>
            <CustomField
              control={form.control}
              name="aspectRatio"
              formLabel="Aspect Ratio"
              className="w-full text-white col-span-12 lg:col-span-10"
              render={({ field }) => (
                <Select
                  onValueChange={(value) =>
                    onSelectFieldHandler(value, field.onChange)
                  }
                  value={field.value || ""}
                >
                  <SelectTrigger className="select-field text-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white">
                    {Object.keys(aspectRatioOptions).map((key) => (
                      <SelectItem key={key} value={key} className="select-item">
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {type === "remove" && (
          <div className={cn(inputStyles.container, "grid grid-cols-12 gap-2")}>
            <CustomField
              control={form.control}
              name="prompt"
              formLabel="Object to remove"
              className="w-full text-white col-span-12 lg:col-span-10"
              render={({ field }) => (
                <Input
                  value={field.value || ""}
                  className={inputStyles.base}
                  placeholder={data?.prompt || ""}
                  onChange={(e) =>
                    onInputChangeHandler(
                      "prompt",
                      e.target.value,
                      type,
                      field.onChange
                    )
                  }
                />
              )}
            />
            <Button
              className={cn(
                buttonStyles.base,
                "col-span-12 lg:col-span-2 w-full"
              )}
              onClick={() => {}}
              disabled={isButtonDisabled}
              size="icon"
            >
              Apply
            </Button>
          </div>
        )}

        {type === "recolor" && (
          <div className={cn(inputStyles.container, "grid grid-cols-12 gap-2")}>
            <div className="flex flex-col gap-4 col-span-12 lg:col-span-10">
              <CustomField
                control={form.control}
                name="prompt"
                formLabel="Object to recolor"
                className="w-full text-white"
                render={({ field }) => (
                  <Input
                    value={field.value || ""}
                    className={inputStyles.base}
                    placeholder={data?.prompt || ""}
                    onChange={(e) =>
                      onInputChangeHandler(
                        "prompt",
                        e.target.value,
                        type,
                        field.onChange
                      )
                    }
                  />
                )}
              />

              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full text-white"
                render={({ field }) => (
                  <Input
                    value={field.value || ""}
                    className={inputStyles.base}
                    placeholder={data?.color || ""}
                    onChange={(e) =>
                      onInputChangeHandler(
                        "color",
                        e.target.value,
                        "recolor",
                        field.onChange
                      )
                    }
                  />
                )}
              />
            </div>
            <Button
              className={cn(
                buttonStyles.base,
                "col-span-12 lg:col-span-2 w-full self-center"
              )}
              onClick={() => {}}
              disabled={isButtonDisabled}
              size="icon"
            >
              Apply
            </Button>
          </div>
        )}

        <div className="grid h-fit min-h-[200px] grid-cols-1 gap-5 py-4 md:grid-cols-2">
          <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                creditBalance={creditBalance}
                generationPrice={generationPrice}
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
                setTransformationConfig={setTransformationConfig}
                setIsButtonDisabled={setIsButtonDisabled}
              />
            )}
          />

          {useStyleTransfer && transformedImageUrl ? (
            <div className="flex flex-col gap-4">
              <div className="flex-between relative">
                <h3 className="text-md text-white font-semibold">
                  Transformed with GPT Image
                </h3>
                <button 
                  className="p-14-medium px-2 absolute top-0 right-0" 
                  onClick={() => window.open(transformedImageUrl, '_blank')}
                >
                  <Image 
                    src="/assets/icons/download.svg"
                    alt="Download"
                    width={24}
                    height={24}
                    className="pb-[6px]"
                  />
                </button>
              </div>
              <div className="relative">
                <Image 
                  src={transformedImageUrl}
                  alt="AI-Generated Style Transfer"
                  width={400}
                  height={300}
                  className="rounded-lg overflow-hidden h-72 md:h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <TransformedImage
              image={image}
              type={type}
              title={"Transformed Image"}
              isTransforming={isTransforming}
              setIsTransforming={setIsTransforming}
              transformationConfig={transformationConfig}
              userId={userId}
              generationPrice={generationPrice}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            className={cn(buttonStyles.base, "w-full")}
            disabled={isButtonDisabled}
          >
            {isTransforming ? "Transforming..." : "Apply Transformation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
