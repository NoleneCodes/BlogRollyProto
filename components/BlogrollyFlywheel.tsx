"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const BlogrollyFlywheel = () => {
  const steps = [
    { title: "① Join & Submit", caption: "Add your blog to the directory" },
    { title: "② Discover & Engage", caption: "Find new readers and bloggers" },
    { title: "③ Shared Authority", caption: "Boost credibility through the network" },
    { title: "④ Network Backlinks", caption: "Grow SEO with mutual linking" },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % steps.length),
      3000
    );
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold">{steps[index].title}</h2>
        <p className="text-gray-600">{steps[index].caption}</p>
      </motion.div>

    </div>
  );
};

export default BlogrollyFlywheel;
