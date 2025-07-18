import { signOut } from "@/auth";
import PieChartBlock from "./pieChartBlock";
import { ComboboxInputContainer } from "./transaction/comboboxinput";

const page = async () => {
  return (
    <div>
      <PieChartBlock></PieChartBlock>
    </div>
  );
};

export default page;
