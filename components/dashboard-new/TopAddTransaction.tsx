"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TopAddTransaction() {
  return (
    <motion.div
      key={"topnav"}
      initial={{ y: -81, height: 0 }}
      animate={{ y: 0, height: 80 }}
      exit={{ y: -81, height: 0 }}
      transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
      className=" flex items-center h-20 px-6 justify-between font-medium  bg-new-background w-full"
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
  );
}
