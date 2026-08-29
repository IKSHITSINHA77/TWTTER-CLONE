"use client";

import React from "react";

interface TwitterLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function TwitterLogo({
  className = "",
  size = "md",
}: TwitterLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${sizeClasses[size]} ${className}`}
      aria-label="Twitter logo"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.963 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
      />
    </svg>
  );
}