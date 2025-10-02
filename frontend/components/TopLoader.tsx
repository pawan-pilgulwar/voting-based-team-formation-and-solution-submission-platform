"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function TopLoader() {
  const { loading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
    } else {
      // small delay so it feels smooth
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[1000] h-0.5 w-full bg-transparent"
    >
      <div
        className={`h-full bg-primary transition-all duration-300 ${
          visible ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}
