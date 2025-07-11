import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const sesion = await auth();

  if (!sesion?.user) redirect("/login");

  return (
    <div>
      <img src={String(sesion?.user?.image)} alt="user avatar" />
      {sesion?.user?.id}
      {sesion?.user?.email}
      {sesion?.user?.name}
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
