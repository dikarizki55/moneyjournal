"use client";

export default function TransactionList({
  data,
}: {
  data: {
    icon: React.ComponentType<{ className?: string }>;
    iconColorTailwind: string;
    title: string;
    description: string[];
    amount: number;
    type: "income" | "outcome";
  }[];
}) {
  return (
    <div className=" w-full shadow-soft bg-new-background rounded-[20px]">
      {data.map((item, idx) => (
        <div key={idx}>
          {idx !== 0 && (
            <hr className=" bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          )}
          <div className=" px-4 py-5 flex justify-between items-start relative">
            <div className=" flex gap-3 items-center">
              <div
                className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${item.iconColorTailwind}`}
              >
                <item.icon className=" w-5 h-5" />
              </div>
              <div className=" flex flex-col tracking-tight gap-1">
                <h1 className=" text-new-foreground font-bold text-sm">
                  {item.title}
                </h1>
                <span className=" text-new-muted-foreground opacity-60 font-medium text-xs whitespace-nowrap tracking-tighter">
                  {item.description.map(
                    (desc, idDesc) => `${idDesc !== 0 ? " • " : ""}${desc}`,
                  )}
                </span>
              </div>
            </div>
            <h1
              className={` absolute right-4 text-sm whitespace-nowrap font-medium ${item.type === "income" ? "text-new-primary" : " text-new-accent-red"}`}
            >
              {item.type === "outcome" && "- "}
              {item.amount.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              })}
            </h1>
          </div>
        </div>
      ))}
    </div>
  );
}
