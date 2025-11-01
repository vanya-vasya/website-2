import { UserButton } from "@clerk/nextjs";

import { MobileSidebar } from "@/components/mobile-sidebar";
import { getApiAvailableGenerations, getApiUsedGenerations } from "@/lib/api-limit";

const Navbar = async () => {
  const apiUsedGenerations = await getApiUsedGenerations();
  const apiAvailableGenerations = await getApiAvailableGenerations();

  return ( 
    <div className="flex items-center p-4 md:hidden">
      <MobileSidebar apiUsedGenerations={apiUsedGenerations} apiAvailableGenerations={apiAvailableGenerations} />
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
   );
}
 
export default Navbar;