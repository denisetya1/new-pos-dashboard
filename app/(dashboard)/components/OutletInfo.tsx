"use client";
import { useGetOutlet } from "@/hooks/useOutlets";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import ChangeOutletModal from "./ChangeOutletModal";

const OutletInfo = ({ onFinishLoading }: { onFinishLoading: () => void }) => {
  const { data: session, status } = useSession();
  const outletId = session?.user?.outletId;
  const {
    isFetching,
    data: outlet,
    isSuccess,
    isError,
  } = useGetOutlet(outletId ? String(outletId) : "");

  useEffect(() => {
    if (status !== "loading" && (!outletId || isSuccess || isError)) {
      onFinishLoading();
    }
  }, [status, outletId, isSuccess, isError, onFinishLoading]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {(status === "loading" || (outletId && isFetching)) && <div>...</div>}
        {status !== "loading" && !outletId && <div>Outlet tidak tersedia</div>}
        {isError && <div>Outlet gagal dimuat</div>}
        {!isFetching && isSuccess && (
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
