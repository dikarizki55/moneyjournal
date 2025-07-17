import { signOut } from "@/auth";
import PieChartBlock from "./pieChartBlock";
import { ComboboxInputContainer } from "./transaction/comboboxinput";

const page = async () => {
  return (
    <div>
      <PieChartBlock></PieChartBlock>
      <ComboboxInputContainer></ComboboxInputContainer>
      <button
        onClick={async () => {
          "use server";
          await signOut();
        }}
        className=" text-white bg-red-500 rounded px-5 py-3 cursor-pointer"
      >
        Signout
      </button>
    </div>
  );
};

export default page;
