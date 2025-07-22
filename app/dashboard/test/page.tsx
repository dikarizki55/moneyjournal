"use client";

import { useEffect, useRef, useState } from "react";

export default function page() {
  const [animate, setAnimate] = useState(false);

  const placeRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    console.log(placeRef.current[0]?.getBoundingClientRect());

    const element = placeRef.current[1]?.getBoundingClientRect();
    setLeft(element ? element.left + element.width : 0);
  }, [placeRef]);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setAnimate(true);
  //   }, 1000);

  //   return () => clearTimeout(timeout);
  // }, [animate]);
  return (
    <div>
      <button
        ref={(el) => {
          placeRef.current[0] = el;
        }}
        onClick={() => setAnimate(!animate)}
      >
        trigger
      </button>
      <button
        ref={(el) => {
          placeRef.current[1] = el;
        }}
        onClick={() => setAnimate(!animate)}
      >
        triggerabcd
      </button>

      <div
        className=" bg-black w-5 h-5"
        style={{
          position: "relative",
          left: left,
          opacity: left,
          transition: "all ease 0.5s",
        }}
      ></div>
    </div>
  );
}
