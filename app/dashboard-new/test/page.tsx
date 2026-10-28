"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function page() {
  const [toggle, setToggle] = useState(false);
  return (
    <div>
      <button
        onClick={() => {
          setToggle(!toggle);
        }}
        className="mb-10"
      >
        Tombol
      </button>
      <Muncul show={toggle}></Muncul>
    </div>
  );
}

function Muncul({ show }: { show: boolean }) {
  console.log("re render bro");
  return (
    <>
      <p>Text</p>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            className=" bg-red-500"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            Muncul
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
