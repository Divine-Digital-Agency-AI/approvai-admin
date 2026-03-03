"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import "./orb.css";

interface OrbProps {
  size?: "logo" | "small" | "medium" | "large" | "xl";
  className?: string;
  responsive?: boolean;
  static?: boolean;
}

const OrbSizes = {
  logo: { width: "36px", height: "36px" },
  small: { width: "160px", height: "160px" },
  medium: { width: "260px", height: "260px" },
  large: { width: "320px", height: "320px" },
  xl: { width: "500px", height: "500px" },
};

export function Orb({ size = "large", className, responsive = false, static: isStatic = false }: OrbProps) {
  const { theme } = useTheme();
  const id = React.useId().replace(/:/g, "");
  const sizeConfig = OrbSizes[size];
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const orbRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isStatic || !orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  }, [isStatic]);

  const handleMouseLeave = React.useCallback(() => {
    if (!isStatic) setMousePosition({ x: 0, y: 0 });
  }, [isStatic]);

  const moveX = isStatic ? 0 : mousePosition.x * 30;
  const moveY = isStatic ? 0 : mousePosition.y * 30;
  const rotateX = isStatic ? 0 : -mousePosition.y * 20;
  const rotateY = isStatic ? 0 : mousePosition.x * 20;

  const responsiveStyles = React.useMemo(() => {
    if (size === "logo") return { width: sizeConfig.width, height: sizeConfig.height };
    if (!responsive) return { width: sizeConfig.width, height: sizeConfig.height };
    if (size === 'xl') return { width: "min(500px, 90vw, 55vh)", height: "min(500px, 90vw, 55vh)" };
    if (size === 'large') return { width: "min(320px, 85vw, 40vh)", height: "min(320px, 85vw, 40vh)" };
    return { width: sizeConfig.width, height: sizeConfig.height, maxWidth: "100%", maxHeight: "100%" };
  }, [responsive, size, sizeConfig]);

  return (
    <div
      ref={orbRef}
      className={cn("relative flex items-center justify-center rounded-full transition-all duration-300 overflow-visible perspective-1000", className)}
      style={responsiveStyles}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn("absolute inset-0 rounded-full transition-all duration-500 -z-10", size === "logo" ? "blur-[12px] opacity-30" : "blur-[60px] opacity-40")}
        style={{
          background: theme === "dark"
            ? "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15), rgba(37, 99, 235, 0.15), transparent 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.2), transparent 70%)",
          transform: isStatic ? "none" : `translate3d(${-mousePosition.x * 40}px, ${-mousePosition.y * 40}px, 0)`,
        }}
      />
      <div
        className="w-full h-full flex items-center justify-center transform-style-3d"
        style={{
          transform: `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible" style={{ shapeRendering: "geometricPrecision" }}>
          <defs>
            <radialGradient id={`${id}-holoCore`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={theme === "dark" ? "#0ea5e9" : "#0284c7"} stopOpacity="0.3" />
              <stop offset="60%" stopColor={theme === "dark" ? "#2563eb" : "#1d4ed8"} stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-ringGradient1`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-ringGradient2`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-ringGradient3`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id={`${id}-glowBlur`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g className="orb-core">
            <circle cx="150" cy="150" r="60" fill={`url(#${id}-holoCore)`} className="animate-pulse-slow" />
            <g opacity="0.6">
              <rect x="110" y="110" width="80" height="80" rx="20" fill="none" stroke={`url(#${id}-ringGradient1)`} strokeWidth="1" transform="rotate(45 150 150)">
                <animateTransform attributeName="transform" type="rotate" from="45 150 150" to="405 150 150" dur="20s" repeatCount="indefinite" />
              </rect>
            </g>
            <g opacity="0.4">
              <rect x="120" y="120" width="60" height="60" rx="15" fill="none" stroke={`url(#${id}-ringGradient2)`} strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="-360 150 150" dur="30s" repeatCount="indefinite" />
              </rect>
            </g>
          </g>
          <g className="orbitals">
            <ellipse cx="150" cy="150" rx="110" ry="30" fill="none" stroke={`url(#${id}-ringGradient1)`} strokeWidth="1.5" strokeLinecap="round" filter={`url(#${id}-glowBlur)`} opacity="0.8">
              <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="12s" repeatCount="indefinite" />
            </ellipse>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="12s" repeatCount="indefinite" />
              {[...Array(2)].map((_, i) => (
                <circle key={`p1-${i}`} r="2" fill={theme === "dark" ? "#bae6fd" : "#0ea5e9"} opacity="0.9">
                  <animateMotion dur="4s" begin={`${i * 2}s`} repeatCount="indefinite" path="M 150 150 m -110 0 a 110 30 0 1 0 220 0 a 110 30 0 1 0 -220 0" />
                </circle>
              ))}
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="360 150 150" to="0 150 150" dur="18s" repeatCount="indefinite" />
              <ellipse cx="150" cy="150" rx="100" ry="30" fill="none" stroke={`url(#${id}-ringGradient2)`} strokeWidth="1.5" strokeLinecap="round" filter={`url(#${id}-glowBlur)`} opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" values="60 150 150; 420 150 150" additive="sum" dur="18s" repeatCount="indefinite" />
              </ellipse>
              {[...Array(2)].map((_, i) => (
                <circle key={`p2-${i}`} r="2" fill={theme === "dark" ? "#bae6fd" : "#0ea5e9"} opacity="0.9">
                  <animateTransform attributeName="transform" type="rotate" values="60 150 150; 420 150 150" additive="sum" dur="18s" repeatCount="indefinite" />
                  <animateMotion dur="5s" begin={`${i * 2.5}s`} repeatCount="indefinite" path="M 150 150 m -100 0 a 100 30 0 1 0 200 0 a 100 30 0 1 0 -200 0" />
                </circle>
              ))}
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="-360 150 150" dur="30s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate" values="-45 150 150; -405 150 150" additive="sum" dur="30s" repeatCount="indefinite" />
              <ellipse cx="150" cy="150" rx="130" ry="40" fill="none" stroke={`url(#${id}-ringGradient3)`} strokeWidth="1" strokeDasharray="4, 8" opacity="0.5" />
              {[...Array(2)].map((_, i) => (
                <circle key={`p3-${i}`} r="1.5" fill="white" opacity="0.6">
                  <animateMotion dur="8s" begin={`${i * 4}s`} repeatCount="indefinite" path="M 150 150 m -130 0 a 130 40 0 1 0 260 0 a 130 40 0 1 0 -260 0" />
                </circle>
              ))}
            </g>
          </g>
          <g className="logo-group" transform="translate(150, 150) scale(0.8)">
            <path d="M -30 40 L 0 -40 L 30 40 M -18 10 L 18 10" fill="none" stroke={theme === "dark" ? "white" : "#1e40af"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" filter={`url(#${id}-glowBlur)`} />
            <circle r="4" cx="0" cy="-40" fill={theme === "dark" ? "#38bdf8" : "#0284c7"} />
            <circle r="4" cx="-30" cy="40" fill={theme === "dark" ? "#60a5fa" : "#3b82f6"} />
            <circle r="4" cx="30" cy="40" fill={theme === "dark" ? "#60a5fa" : "#3b82f6"} />
          </g>
        </svg>
      </div>
    </div>
  );
}
