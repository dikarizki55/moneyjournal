"use client";
import { useSession } from "next-auth/react";
import React from "react";

const page = () => {
  const session = useSession();

  return <div>this is account settings {JSON.stringify(session)}</div>;
};

export default page;
