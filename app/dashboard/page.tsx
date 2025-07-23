import PieChartBlock from "./pieChartBlock";
import Wallet from "@/components/block/wallet";
import MonthlyBar from "@/components/block/monthlyBar";

const page = async () => {
  return (
    <div className="px-5 w-full flex flex-col gap-4 pb-10 relative">
      <Wallet></Wallet>
      <PieChartBlock></PieChartBlock>
      <MonthlyBar />
    </div>
  );
};

export default page;
