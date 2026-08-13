import Navbar from "@/component/navbar/navbar";
import OrderOcrWorkspace from "@/component/order-ocr/order-ocr-workspace";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <OrderOcrWorkspace />
      </main>
    </>
  );
}
