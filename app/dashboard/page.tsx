import PieChartBlock from "./pieChartBlock";
import Wallet from "@/components/block/wallet";
import MonthlyBar from "@/components/block/monthlyBar";
import CategoryChart from "./CategoryChart";

const page = async () => {
  return (
    <div className="px-5 w-full flex flex-col gap-4 pb-10 relative">
      <Wallet></Wallet>
      <div className=" flex gap-4">
        <div className=" w-1/2">
          <MonthlyBar />
        </div>
        <div className="w-1/2">
          <PieChartBlock></PieChartBlock>
        </div>
      </div>
      <CategoryChart></CategoryChart>
    </div>
  );
};

export default page;
