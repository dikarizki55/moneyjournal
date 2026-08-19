"use client";

import { IconCheckmark, IconChevronDown } from "../Icon";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Drawer from "../Drawer";

export default function CategorySelector({
  action,
  list,
}: {
  action?: (selectedData: string[] | null) => void;
  list: {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColorTailwind: string;
    title: string;
  }[];
}) {
  const [select, setSelect] = useState<string[] | null>(null);
  const [selectedBefore, setSelectedBefore] = useState<string[] | null>(null);

  const selectList = (id: string) => {
    if (!id) return;
    setSelect((prev) => {
      if (!prev) return [id];

      const isExist = prev.includes(id);

      if (isExist) {
        const filtered = prev.filter((item) => item !== id);
        return filtered.length > 0 ? filtered : null;
      } else {
        return [...prev, id];
      }
    });
  };

  useEffect(() => {
    if (!action) return;
    action(select);
  }, [select]);

  return (
    <Drawer
      title={select ? `${select.length} Selected` : "All Category"}
      inDrawerTitle="Category"
      onCancel={() => {
        setSelect(selectedBefore);
      }}
      onDone={() => {
        setSelectedBefore(select);
      }}
    >
      <AnimatePresence mode="wait">
        {select && select.length > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 24 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
            className=" w-full flex justify-end px-5 overflow-hidden"
          >
            <motion.button
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
              className=" text-new-primary text-xs px-2 py-1 rounded-full bg-new-muted-background"
              onClick={() => {
                setSelect(null);
              }}
            >
              {select.length} Selected x
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className=" flex flex-col">
        {list.map((item, idx) => (
          <div key={idx}>
            {idx !== 0 && (
              <hr className=" bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className=" flex justify-between items-center px-5 py-5 w-full "
              onClick={() => selectList(item.id)}
            >
              <div className="flex gap-3 items-center">
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${item.iconColorTailwind}`}
                >
                  <item.icon className=" w-5 h-5" />
                </div>
                <h1 className="">{item.title}</h1>
              </div>
              <div className=" relative w-5 h-5">
                <AnimatePresence mode="sync">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={`${item.id}-${select?.includes(item.id) ? "active" : "inactive"}`}
                    className={` absolute text-new-background rounded-full w-5 h-5 ${select?.includes(item.id) ? "bg-new-primary" : "bg-new-background border-new-muted-foreground border"}  flex items-center justify-center`}
                  >
                    <IconCheckmark className="" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
