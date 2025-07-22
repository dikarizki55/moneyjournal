import ThemeToggle from "@/components/block/themeToggle";
import PieChartBlock from "./pieChartBlock";
import Wallet from "@/components/block/wallet";

const page = async () => {
  return (
    <div className=" px-5 w-full">
      <Wallet></Wallet>
      <PieChartBlock></PieChartBlock>
    </div>
  );
};

export default page;
