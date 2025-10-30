"use client"

import { updateCredits } from '@/lib/actions/user.actions'
import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import { useRouter } from "next/navigation";
import Image from 'next/image'
import React, { useTransition } from 'react'

const TransformedImage = ({ image, type, title, transformationConfig, isTransforming, setIsTransforming, hasDownload = true, userId, generationPrice }: TransformedImageProps) => {

  const [isPending, startTransition] = useTransition()
  const router = useRouter();

  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if(transformationConfig){
      download(getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig
      }), title)
    }

  }

  const payment = async () => {
    await updateCredits(userId, generationPrice)
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between relative">
        <h3 className="text-md text-white font-semibold ">
          Transformed
        </h3>
        {hasDownload && (
          <button 
            className="p-14-medium px-2 absolute top-0 right-0" 
            onClick={downloadHandler}
          >
            <Image 
              src="/assets/icons/download.svg"
              alt="Download"
              width={24}
              height={24}
              className="pb-[6px]"
            />
          </button>
        )}
      </div>
      

      {image?.publicId && transformationConfig ? (
        <div className="relative">
          <CldImage 
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            src={image?.publicId}
            alt="Transformed Image"
            sizes={"(max-width: 767px) 100vw, 50vw"}
            placeholder={dataUrl as PlaceholderValue}
            className="text-sm h-72 md:h-full flex-col gap-5 border bg-card text-card-foreground shadow-inner rounded-lg overflow-hidden"
            onLoad={() => {
              setIsTransforming && setIsTransforming(false);
              payment();
            }}
            onError={() => {
              debounce(() => {
                setIsTransforming && setIsTransforming(false);
              }, 8000)()
            }}
            {...transformationConfig}
          />

          {isTransforming && (
            <div className="flex-center absolute left-[50%] top-[50%] size-full -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-[10px] bg-dark-700/90">
              <Image 
                className='mx-auto animate-spin'
                src="/logos/nerbixa-icon.png"
                width={50}
                height={50}
                alt="Loading"
              />
              <p className="text-white/80">Please wait...</p>
            </div>
          )}
        </div>
      ): (
        <div className="flex justify-center items-center bg-slate-800 border-slate-800 text-muted-foreground text-sm h-72 md:h-full flex-col gap-5 border bg-card shadow-inner rounded-lg overflow-hidden">
          Transformed Image
        </div>
      )}
    </div>

  )
}

export default TransformedImage