/* eslint-disable no-unused-vars */


declare type User = {
  clerkId: string;
  email: string;
  photo: string;
  firstName: string | null;
  lastName: string | null;
  planId: number | null;
  creditBalance: number | null;
}

// ====== USER PARAMS
declare type CreateUserParams = {
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    photo: string;
  };
  
  
  declare type UpdateUserParams = {
    firstName: string | null;
    lastName: string | null;
    photo: string;
  };
  
  // ====== IMAGE PARAMS
  declare type AddImageParams = {
    image: {
      title: string;
      publicId: string;
      transformationType: string;
      width: number;
      height: number;
      config: any;
      secureURL: string;
      transformationURL: string;
      aspectRatio: string | undefined;
      prompt: string | undefined;
      color: string | undefined;
    };
    userId: number;
    path: string;
  };
  
  declare type UpdateImageParams = {
    image: {
      id: number;
      title: string;
      publicId: string;
      transformationType: string;
      width: number;
      height: number;
      config: any;
      secureURL: string;
      transformationURL: string;
      aspectRatio: string | undefined;
      prompt: string | undefined;
      color: string | undefined;
    };
    userId: number;
    path: string;
  };
  
  declare type Transformations = {
    restore?: boolean;
    fillBackground?: boolean;
    remove?: {
      prompt: string;
      removeShadow?: boolean;
      multiple?: boolean;
    };
    recolor?: {
      prompt?: string;
      to: string;
      multiple?: boolean;
    };
    removeBackground?: boolean;
  };
  
  // ====== TRANSACTION PARAMS
  declare type CheckoutTransactionParams = {
    plan: string;
    credits: number;
    amount: number;
    buyerId: string;
  };
  
  declare type CreateTransactionParams = {
    stripeId: string;
    amount: number;
    credits: number;
    plan: string;
    buyerId: string;
    createdAt: Date;
  };
  
  declare type TransformationTypeKey =
    | "restore"
    | "fill"
    | "remove"
    | "recolor"
    | "removeBackground";
  
  // ====== URL QUERY PARAMS
  declare type FormUrlQueryParams = {
    searchParams: string;
    key: string;
    value: string | number | null;
  };
  
  declare type UrlQueryParams = {
    params: string;
    key: string;
    value: string | null;
  };
  
  declare type RemoveUrlQueryParams = {
    searchParams: string;
    keysToRemove: string[];
  };
  
  declare type SearchParamProps = {
    params: { id: number; type: TransformationTypeKey };
    searchParams: { [key: string]: string | string[] | undefined };
  };
  
  declare type TransformationFormProps = {
    userId: string;
    type: TransformationTypeKey;
    generationPrice: number;
    creditBalance: number;
    data?: Image | null;
    config?: object | null;
    useStyleTransfer?: boolean;
  };
  
  declare type TransformedImageProps = {
    image: any;
    type: string;
    title: string;
    transformationConfig: object | null;
    isTransforming: boolean;
    hasDownload?: boolean;
    setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
    userId: string;
    generationPrice: number;
  };