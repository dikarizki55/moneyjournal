"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function page() {
  return (
    <div>
      {/* <AnimatePresence mode="wait">
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
          className=" flex items-center h-20 px-6 justify-between font-medium"
        >
          <Link href={"/dashboard-new/"} className=" text-new-primary w-20">
            Cancel
          </Link>
          <h1 className=" font-bold text-lg">Add Transaction</h1>
          <Link
            href={"/dashboard-new/"}
            className=" text-new-primary w-20 text-right"
          >
            Done
          </Link>
        </motion.div>
      </AnimatePresence> */}
      Wallet Page
    </div>
  );
}
