import { signOut } from "@/auth";
import PieChartBlock from "./pieChartBlock";

const page = async () => {
  return (
    <div>
      <PieChartBlock></PieChartBlock>
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
