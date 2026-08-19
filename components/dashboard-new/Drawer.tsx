"use client";

import { IconChevronDown } from "./Icon";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Drawer({
  title,
  inDrawerTitle,
  onCancel,
  onDone,
  children,
}: {
  title: string;
  inDrawerTitle: string;
  onCancel?: () => void;
  onDone?: () => void;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          setShow(true);
        }}
        className="text-xs bg-new-muted-background rounded-full py-2 px-4 flex items-center gap-2"
      >
        {title} <IconChevronDown className=" w-2 h-2" />
      </button>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0.1)" }}
            exit={{ backgroundColor: "rgba(0,0,0,0)" }}
            transition={{ duration: 0.5 }}
            className=" fixed left-0 top-0 w-full h-full  z-1000 pt-10"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.5, 0, 0.1, 1] }}
              className=" w-full h-full bg-new-background rounded-t-[20px]"
            >
              <div className=" w-full h-20 py-7 flex justify-between items-center">
                <button
                  onClick={() => {
                    setShow(false);
                    if (onCancel) onCancel();
                  }}
                  className=" text-new-primary w-20"
                >
                  Cancel
                </button>
                <h1 className=" font-bold text-lg">{inDrawerTitle}</h1>
                <button
                  onClick={() => {
                    setShow(false);
                    if (onDone) onDone();
                  }}
                  className=" text-new-primary w-20"
                >
                  Done
                </button>
              </div>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
