import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import TransformationForm from "@/components/shared/TransformationForm";
import { getUserAvailableGenerations } from "@/lib/utils";
import { FeatureContainer } from "@/components/feature-container";
import { contentStyles } from "@/components/ui/feature-styles";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

const ImageRestorePage = async () => {
  const {userId} = auth();
  
  if(!userId) redirect('/sign-in');
  
  const user = await getUserById(userId);  

  if(!user) redirect('/sign-in');

  const balance = getUserAvailableGenerations(user);

  return ( 
    <FeatureContainer
      title="Image Restore"
      description={`Refine images by removing noise and imperfections. (Price: ${MODEL_GENERATIONS_PRICE.imageRestore} credits)`}
      iconName={"ArchiveRestore"}
      iconColor="text-purple-500"
      bgColor="bg-purple-500/10"
    >
      <div className={contentStyles.base}>
        <TransformationForm
          userId={user.id}
          type={"restore" as TransformationTypeKey}
          creditBalance={balance}
          generationPrice={MODEL_GENERATIONS_PRICE.imageRestore}
        />
      </div>
    </FeatureContainer>
   );
}
 
export default ImageRestorePage;