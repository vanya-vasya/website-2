"use client";

import { useToast } from "@/components/ui/use-toast";
import { useProModal } from "@/hooks/use-pro-modal";
import { checkApiLimit } from "@/lib/api-limit";
import { dataUrl, getImageSize } from "@/lib/utils";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

type MediaUploaderProps = {
  creditBalance: number;
  generationPrice: number;
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<any>;
  publicId: string;
  image: any;
  type: string;
  setTransformationConfig: React.Dispatch<React.SetStateAction<null | object>>;
  setIsButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const MediaUploader = ({
  creditBalance,
  generationPrice,
  onValueChange,
  setImage,
  image,
  publicId,
  type,
  setTransformationConfig,
  setIsButtonDisabled,
}: MediaUploaderProps) => {
  const { toast } = useToast();
  const proModal = useProModal();
  const onUploadSuccessHandler = (result: any) => {
    setTransformationConfig(null);
    setIsButtonDisabled(false);
    setImage((prevState: any) => ({
      ...prevState,
      publicId: result?.info?.public_id,
      width: result?.info?.width,
      height: result?.info?.height,
      secureURL: result?.info?.secure_url,
    }));

    onValueChange(result?.info?.public_id);
  };

  const onUploadErrorHandler = () => {
    toast({
      title: "Something went wrong while uploading",
      description: "Please try again",
      duration: 5000,
      className: "error-toast",
    });
  };

  const openUploader = (open: any) => {
    if (creditBalance >= generationPrice) {
      open();
    } else {
      proModal.onOpen();
    }
  };

  return (
    <CldUploadWidget
      uploadPreset="nerbixa"
      options={{
        multiple: false,
        resourceType: "image",
      }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="text-md text-white font-semibold">Original</h3>

          {publicId ? (
            <>
              <div
                className="cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openUploader(open)}
              >
                <CldImage
                  width={getImageSize(type, image, "width")}
                  height={getImageSize(type, image, "height")}
                  src={publicId}
                  alt="Original Image"
                  sizes={"(max-width: 767px) 100vw, 50vw"}
                  placeholder={dataUrl as PlaceholderValue}
                  className="text-sm  h-72 md:h-full flex-col gap-5 border bg-card text-card-foreground shadow-inner rounded-lg overflow-hidden"
                />
              </div>
            </>
          ) : (
            <div
              className="flex justify-center items-center h-72 cursor-pointer flex-col gap-5 border bg-slate-800 border-slate-800 bg-card text-card-foreground shadow-inner rounded-lg overflow-hidden"
              onClick={() => openUploader(open)}
            >
              <div className="rounded-[16px p-5 shadow-sm">
                <Image
                  src="/assets/icons/add.svg"
                  alt="Add Image"
                  width={32}
                  height={32}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Click here to upload image
              </p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;
