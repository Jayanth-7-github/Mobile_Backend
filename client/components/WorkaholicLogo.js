// WorkaholicLogo.js
import React from "react";
import { useColorScheme } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  G,
  Text as SvgText,
} from "react-native-svg";

/**
 * Props:
 *  - size: number (logo height in px). Default 120.
 *  - style: style object passed to Svg.
 *  - accent: optional override color for primary accent.
 */
export default function WorkaholicLogo({ size = 120, style, accent }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Colors
  const primary = accent ?? (isDark ? "#60A5FA" : "#6200EE"); // purple/blue
  const caseFill = isDark ? "#111216" : "#F3F4FF"; // briefcase main fill
  const textColor = isDark ? "#E6EEF9" : "#111827"; // wordmark color
  const shadow = isDark ? "#00000066" : "#00000022";

  // We will design within a 400x120 viewBox (wide wordmark)
  const vbW = 400;
  const vbH = 120;
  const scale = size / vbH; // caller sets total height

  return (
    <Svg
      width={vbW * scale}
      height={vbH * scale}
      viewBox={`0 0 ${vbW} ${vbH}`}
      style={style}
    >
      <Defs>
        {/* subtle gradient on briefcase */}
        <LinearGradient id="g-case" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={caseFill} stopOpacity="1" />
          <Stop offset="1" stopColor={primary} stopOpacity="0.06" />
        </LinearGradient>

        {/* subtle glossy highlight */}
        <LinearGradient id="g-gloss" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <Stop offset="1" stopColor="#fff" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* container group for shadow + mark */}
      <G>
        {/* Shadow under briefcase */}
        <Rect
          x="10"
          y="22"
          rx="12"
          width="90"
          height="60"
          fill={shadow}
          transform="translate(6 6) scale(1 0.9)"
          opacity="0.18"
        />

        {/* Briefcase body */}
        <Rect
          x="10"
          y="22"
          rx="12"
          width="90"
          height="60"
          fill="url(#g-case)"
          stroke={primary}
          strokeWidth="3"
        />

        {/* briefcase top flap */}
        <Path
          d="M10 30 L100 30 L86 22 L24 22 Z"
          fill="url(#g-case)"
          stroke={primary}
          strokeWidth="2"
        />

        {/* handle */}
        <Path
          d="M38 22 C38 10, 62 10, 62 22"
          fill="none"
          stroke={primary}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* latch/simple detail */}
        <Path
          d="M52 48 h-6 a2 2 0 0 0 -2 2 v10 a2 2 0 0 0 2 2 h18 a2 2 0 0 0 2 -2 v-10 a2 2 0 0 0 -2 -2 h-6"
          fill="none"
          stroke={isDark ? "#0ea5e9" : "#4c1d95"}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* sparkle top-right */}
        <G transform="translate(98 12) rotate(8)">
          <Path
            d="M6 0 L8.6 3.8 L13 5.4 L8.6 6.6 L6 10 L4 6.6 L-0.4 5.4 L4 3.8 Z"
            fill={primary}
            opacity="0.95"
            transform="scale(2.2)"
          />
        </G>
      </G>

      {/* Wordmark: "Workaholic" */}
      {/* We'll simulate a modern sans-serif logo using SVG text with letter-spacing */}
      <SvgText
        x="120"
        y="70"
        fontSize="42"
        fontWeight="700"
        fontFamily="System"
        fill={textColor}
      >
        Work
      </SvgText>

      <SvgText
        x="218"
        y="70"
        fontSize="42"
        fontWeight="700"
        fontFamily="System"
        fill={primary}
      >
        aholic
      </SvgText>

      {/* subtle underline / brand strip */}
      <Rect
        x="120"
        y="82"
        width="200"
        height="6"
        rx="3"
        fill={primary}
        opacity="0.12"
      />

      {/* small tagline below */}
      <SvgText
        x="120"
        y="100"
        fontSize="10"
        fontWeight="600"
        fontFamily="System"
        fill={isDark ? "#93C5FD" : "#6B21A8"}
        opacity="0.85"
      >
        get things done — efficiently
      </SvgText>
    </Svg>
  );
}
