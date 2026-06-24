import { Prisma } from "@/generated/prisma/client";

type Transaction = Prisma.TransactionGetPayload<{
  include: {
    user: true;
    outlet: true;
    userShift: {
      include: {
        shift: true;
      };
    };
    outletPaymentMethod: {
      include: {
        paymentMethod: true;
      };
    };
  };
}>;
