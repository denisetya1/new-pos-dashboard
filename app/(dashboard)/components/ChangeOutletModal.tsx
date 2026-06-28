import { useGetOutlets } from "@/hooks/useOutlets";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Outlet } from "@/generated/prisma/client";
import { CheckCircle } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ChangeOutletForm = ({
  onSuccess,
  outletId,
}: {
  outletId: string;
  onSuccess?: () => void;
}) => {
  const { data: outletsData } = useGetOutlets();
  const { data: outlets } = outletsData || {};
  const { update } = useSession();

  const handleChangeOutlet = async (id: string) => {
    try {
      const result = await update({ outletId: id });
      if (!result) throw new Error("Update returned null");

      toast.success("Berhasil mengubah outlet.", {
        position: "top-right",
        autoClose: 1500,
        onClose: () => {
          window.location.href = "/home";
        },
      });
    } catch (error) {
      toast.error("Gagal mengubah outlet!", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  return (
    <div className="border rounded-md p-3 max-h-100 overflow-y-auto">
      {outlets?.length > 0 &&
        outlets.map((o: Outlet) => (
          <div
            key={String(o.id)}
            className="flex justify-between items-center border-b border-gray-200 p-4"
          >
            <div>{o?.name}</div>
            <div className="flex items-center justify-center w-20">
              {outletId === `${o.id}` && (
                <div className="m-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <CheckCircle className="text-blue-600" />
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Outlet Saat Ini</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
              {outletId !== `${o.id}` && (
                <Button
                  onClick={() => handleChangeOutlet(String(o.id))}
                  className="m-auto"
                >
                  Pilih
                </Button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

const ChangeOutletModal = ({
  outletId,
  onSuccess,
}: {
  outletId: string;
  onSuccess?: () => void;
}) => {
  return (
    <Modal
      title={"Pilih Outlet"}
      trigger={
        <Button variant="default" size="sm">
          Ubah Outlet
        </Button>
      }
    >
      <ChangeOutletForm outletId={outletId} onSuccess={onSuccess} />
    </Modal>
  );
};

export default ChangeOutletModal;
