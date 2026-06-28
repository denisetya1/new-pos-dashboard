"use client";
import { Button } from "@/components/ui/button";
import { useGetOutlet } from "@/hooks/useOutlets";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import ChangeOutletModal from "./ChangeOutletModal";

const OutletInfo = ({ onFinishLoading }: { onFinishLoading: () => void }) => {
  const { data: session, status } = useSession();
  const {
    isPending,
    data: outlet,
    isSuccess,
  } = useGetOutlet(String(session?.user?.outletId));

  useEffect(() => {
    if (status !== "loading" && !isPending && isSuccess) {
      onFinishLoading();
    }
  }, [status, isPending, isSuccess, onFinishLoading]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {isPending && <div>...</div>}
        {!isPending && isSuccess && (
          <div className="flex gap-3 items-center">
            <div>
              <strong>Outlet: </strong>
              <span className="mr-10">{outlet?.data?.name}</span>
            </div>
            <ChangeOutletModal outletId={outlet?.data?.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutletInfo;
