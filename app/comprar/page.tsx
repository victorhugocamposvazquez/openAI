import { Suspense } from "react";
import BuyFlow from "@/components/buy/BuyFlow";

export default function Page() {
  // Suspense: BuyFlow lee searchParams (?modo=recibir) en cliente.
  return (
    <Suspense fallback={null}>
      <BuyFlow />
    </Suspense>
  );
}
