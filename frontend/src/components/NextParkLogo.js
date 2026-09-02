import React from "react";
import logoBadgeImg from "../assets/branding/nextpark-logo-badge.png";
import "../styles/NextParkLogo.css";

/**
 * NextPark AI Official Logo Component
 * Production-ready vector SVG & raster badge component.
 *
 * @param {Object} props
 * @param {"compact" | "full" | "icon" | "badge"} [props.variant="compact"]
 * @param {number} [props.height]
 * @param {"dark" | "light"} [props.theme="dark"]
 * @param {boolean} [props.animated=true]
 * @param {string} [props.className=""]
 */
export default function NextParkLogo({
  variant = "compact",
  height,
  theme = "dark",
  animated = true,
  className = "",
  style = {},
}) {
  const defaultHeight =
    height ||
    (variant === "badge"
      ? 80
      : variant === "full"
      ? 46
      : variant === "icon"
      ? 36
      : 38);

  const containerClasses = [
    "np-logo-container",
    `np-variant-${variant}`,
    `np-theme-${theme}`,
    animated ? "np-animated" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // 1. 3D Badge Variant (from original artwork with transparent background)
  if (variant === "badge") {
    return (
      <div
        className={containerClasses}
        style={{ height: defaultHeight, ...style }}
      >
        <img
          src={logoBadgeImg}
          alt="NextPark AI - Smart Parking System"
          className="np-logo-badge"
          style={{ height: defaultHeight, width: "auto" }}
        />
      </div>
    );
  }

  // 2. Icon-Only Variant (Square viewBox: 0 0 160 160)
  if (variant === "icon") {
    return (
      <div
        className={containerClasses}
        style={{
          height: defaultHeight,
          width: defaultHeight,
          display: "inline-block",
          ...style,
        }}
      >
        <svg
          viewBox="0 0 160 160"
          height={defaultHeight}
          width={defaultHeight}
          className="np-logo-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="npGlowIcon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#0066FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#001133" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="npBlueIcon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="30%" stopColor="#0080FF" />
              <stop offset="100%" stopColor="#0040C8" />
            </linearGradient>
            <linearGradient id="npBlueIcon2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#002B80" />
              <stop offset="60%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#38B6FF" />
            </linearGradient>
            <filter id="npNeonIcon" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <clipPath id="npClipChamberIcon">
              <path d="M 76 48 L 112 48 C 126 48, 132 58, 132 76 C 132 94, 124 102, 108 102 L 76 102 Z" />
            </clipPath>
          </defs>

          <circle cx="80" cy="80" r="72" fill="url(#npGlowIcon)" />

          {/* Speed Lines */}
          <g opacity="0.95">
            <rect x="10" y="52" width="22" height="4.5" rx="2.25" fill="#00D2FF" filter="url(#npNeonIcon)" />
            <rect x="6" y="61" width="26" height="5" rx="2.5" fill="#00F0FF" />
            <rect x="14" y="71" width="20" height="4.5" rx="2.25" fill="#0088FF" />
            <circle cx="20" cy="63.5" r="2" fill="#FFFFFF" />
            <rect x="12" y="80" width="18" height="4" rx="2" fill="#00D2FF" />
          </g>

          {/* Main NP Monogram */}
          <path d="M 32 36 L 50 36 L 50 114 L 32 114 Z" fill="url(#npBlueIcon1)" />
          <path d="M 48 36 L 76 96 L 76 114 L 46 54 Z" fill="url(#npBlueIcon2)" opacity="0.95" />
          <path
            d="M 68 36 L 118 36 C 142 36, 146 54, 146 76 C 146 98, 138 114, 114 114 L 72 114 L 72 96 L 112 96 C 126 96, 128 88, 128 76 C 128 62, 122 54, 108 54 L 68 54 Z"
            fill="url(#npBlueIcon1)"
            filter="url(#npNeonIcon)"
          />

          {/* Parking Chamber */}
          <g clipPath="url(#npClipChamberIcon)">
            <rect x="70" y="44" width="70" height="64" fill="#040914" />
            <polygon points="104 48, 88 88, 120 88" fill="#00F0FF" opacity="0.3" />
            <ellipse cx="104" cy="49" rx="4" ry="2.5" fill="#00F0FF" filter="url(#npNeonIcon)" />
            <path d="M 74 104 Q 92 84, 104 82 Q 116 84, 134 104 Z" fill="#0A1628" />
            <path d="M 104 84 L 104 90 M 104 94 L 104 102" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2" />

            {/* Smart Car */}
            <g transform="translate(94, 73)">
              <path d="M 4 8 L 7 3 L 13 3 L 16 8 Z" fill="#E2E8F0" />
              <rect x="2" y="7.5" width="16" height="5" rx="1.5" fill="#FFFFFF" />
              <ellipse cx="4.5" cy="9.5" rx="1.5" ry="1" fill="#00F0FF" filter="url(#npNeonIcon)" />
              <ellipse cx="15.5" cy="9.5" rx="1.5" ry="1" fill="#00F0FF" filter="url(#npNeonIcon)" />
              <rect x="7" y="9" width="6" height="2" rx="0.5" fill="#0A1128" />
              <path
                d="M 0 3 L 2 3 M 0 3 L 0 5 M 20 3 L 18 3 M 20 3 L 20 5 M 0 13 L 2 13 M 0 13 L 0 11 M 20 13 L 18 13 M 20 13 L 20 11"
                stroke="#00F0FF"
                strokeWidth="0.8"
                fill="none"
              />
            </g>

            {/* Pillar */}
            <rect x="122" y="66" width="7" height="18" rx="1.2" fill="#07101E" stroke="#0080FF" strokeWidth="0.6" />
            <text x="125.5" y="73" fill="#00D2FF" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="5" textAnchor="middle">
              P
            </text>
            <rect x="123" y="75" width="5" height="4" rx="0.5" fill="#00E676" />
          </g>

          {/* Road */}
          <path d="M 108 102 Q 86 104, 66 112 Q 54 118, 44 126 L 80 126 Q 94 116, 114 114 Z" fill="url(#npBlueIcon1)" opacity="0.8" />
          <path d="M 44 126 Q 66 114, 98 106" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.9" />

          {/* GPS Pin */}
          <g transform="translate(68, 98)">
            <circle cx="6" cy="6" r="6" fill="#00D2FF" opacity="0.3" filter="url(#npNeonIcon)" />
            <path d="M 6 0 C 3.2 0, 1 2.2, 1 5 C 1 8.5, 6 14, 6 14 C 6 14, 11 8.5, 11 5 C 11 2.2, 8.8 0, 6 0 Z" fill="url(#npBlueIcon1)" />
            <circle cx="6" cy="4.8" r="2.2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    );
  }

  // 3. Horizontal Variants ("compact" or "full")
  const isFull = variant === "full";
  const viewBox = isFull ? "0 0 520 116" : "0 0 400 90";
  const calcWidth = isFull ? defaultHeight * (520 / 116) : defaultHeight * (400 / 90);
  const textColor = theme === "light" ? "#0F172A" : "#FFFFFF";
  const taglineColor = theme === "light" ? "#475569" : "#94A3B8";

  return (
    <div
      className={containerClasses}
      style={{
        height: defaultHeight,
        width: "auto",
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      <svg
        viewBox={viewBox}
        height={defaultHeight}
        width={calcWidth}
        className="np-logo-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`npBlueH1_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="30%" stopColor="#0080FF" />
            <stop offset="100%" stopColor="#0040C8" />
          </linearGradient>
          <linearGradient id={`npBlueH2_${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#002B80" />
            <stop offset="60%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#38B6FF" />
          </linearGradient>
          <linearGradient id={`npCyanH_${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0077FE" />
          </linearGradient>
          <filter id={`npNeonH_${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id={`npClipChamberH_${variant}`}>
            <path d="M 68 34 L 98 34 C 110 34, 116 42, 116 57 C 116 72, 110 79, 95 79 L 68 79 Z" />
          </clipPath>
        </defs>

        {/* Emblem Left Side */}
        <g transform="translate(6, 0)">
          {/* Speed Streaks */}
          <rect x="0" y="38" width="18" height="3.5" rx="1.75" fill="#00D2FF" filter={`url(#npNeonH_${variant})`} />
          <rect x="-4" y="45" width="22" height="4" rx="2" fill="#00F0FF" />
          <rect x="2" y="53" width="16" height="3.5" rx="1.75" fill="#0088FF" />
          <circle cx="8" y="47" r="1.5" fill="#FFFFFF" />
          <rect x="1" y="60" width="14" height="3" rx="1.5" fill="#00D2FF" />

          {/* NP Structure */}
          <path d="M 28 24 L 43 24 L 43 88 L 28 88 Z" fill={`url(#npBlueH1_${variant})`} />
          <path d="M 41 24 L 64 74 L 64 88 L 39 38 Z" fill={`url(#npBlueH2_${variant})`} />
          <path
            d="M 58 24 L 102 24 C 122 24, 126 38, 126 56 C 126 74, 119 87, 98 87 L 62 87 L 62 72 L 96 72 C 108 72, 110 65, 110 56 C 110 44, 105 38, 93 38 L 58 38 Z"
            fill={`url(#npBlueH1_${variant})`}
            filter={`url(#npNeonH_${variant})`}
          />

          {/* Parking Bay Interior */}
          <g clipPath={`url(#npClipChamberH_${variant})`}>
            <rect x="62" y="30" width="60" height="54" fill="#040914" />
            <polygon points="90 32, 76 66, 104 66" fill="#00F0FF" opacity="0.3" />
            <ellipse cx="90" cy="33" rx="3.5" ry="2" fill="#00F0FF" filter={`url(#npNeonH_${variant})`} />
            <path d="M 66 79 Q 80 62, 90 60 Q 100 62, 116 79 Z" fill="#0A1628" />
            <path d="M 90 62 L 90 67 M 90 71 L 90 77" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1.5 1.5" />
            {/* Car */}
            <g transform="translate(82, 54)">
              <path d="M 3 6 L 5.5 2.5 L 10.5 2.5 L 13 6 Z" fill="#E2E8F0" />
              <rect x="1.5" y="5.5" width="13" height="4.5" rx="1.2" fill="#FFFFFF" />
              <ellipse cx="3.5" cy="7.2" rx="1.2" ry="0.8" fill="#00F0FF" />
              <ellipse cx="12.5" cy="7.2" rx="1.2" ry="0.8" fill="#00F0FF" />
              <rect x="5.5" y="7" width="5" height="1.5" rx="0.4" fill="#0A1128" />
              <path
                d="M 0 2 L 1.5 2 M 0 2 L 0 3.5 M 16 2 L 14.5 2 M 16 2 L 16 3.5 M 0 10 L 1.5 10 M 0 10 L 0 8.5 M 16 10 L 14.5 10 M 16 10 L 16 8.5"
                stroke="#00F0FF"
                strokeWidth="0.7"
                fill="none"
              />
            </g>
            <rect x="106" y="47" width="6" height="15" rx="1" fill="#07101E" stroke="#0080FF" strokeWidth="0.5" />
            <text x="109" y="53" fill="#00D2FF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="4" textAnchor="middle">
              P
            </text>
            <rect x="107" y="55" width="4" height="3" rx="0.5" fill="#00E676" />
          </g>

          {/* Road */}
          <path d="M 92 80 Q 72 82, 54 89 Q 44 94, 36 100 L 66 100 Q 78 92, 98 87 Z" fill={`url(#npBlueH1_${variant})`} opacity="0.85" />
          <path d="M 36 100 Q 56 90, 84 83" stroke="#FFFFFF" strokeWidth="1.3" strokeDasharray="2.5 2.5" />

          {/* GPS Pin */}
          <g transform="translate(56, 76)">
            <circle cx="5" cy="5" r="5" fill="#00D2FF" opacity="0.4" filter={`url(#npNeonH_${variant})`} />
            <path d="M 5 0 C 2.7 0, 0.8 1.8, 0.8 4.1 C 0.8 7, 5 11.5, 5 11.5 C 5 11.5, 9.2 7, 9.2 4.1 C 9.2 1.8, 7.3 0, 5 0 Z" fill={`url(#npBlueH1_${variant})`} />
            <circle cx="5" cy="3.9" r="1.8" fill="#FFFFFF" />
          </g>
        </g>

        {/* Right Side Typography */}
        <g transform="translate(148, 0)">
          {/* "Next Park" */}
          <text
            x="0"
            y="65"
            fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
            fontSize="46"
            fontWeight="800"
            fill={textColor}
            letterSpacing="-0.5"
            className="np-brand-text"
          >
            Ne<tspan fill={`url(#npCyanH_${variant})`}>x</tspan>t<tspan dx="8" fill={textColor}>Park</tspan>
          </text>

          {/* "AI" Gradient Badge */}
          <g transform="translate(262, 27)">
            <rect
              x="0"
              y="0"
              width="70"
              height="42"
              rx="8"
              fill={`url(#npCyanH_${variant})`}
              opacity="0.15"
              filter={`url(#npNeonH_${variant})`}
            />
            <rect
              x="0"
              y="0"
              width="70"
              height="42"
              rx="8"
              fill="none"
              stroke={`url(#npCyanH_${variant})`}
              strokeWidth="1.8"
            />
            <text
              x="35"
              y="30"
              fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
              fontSize="30"
              fontWeight="900"
              fill={`url(#npCyanH_${variant})`}
              textAnchor="middle"
              letterSpacing="1"
            >
              AI
            </text>
          </g>

          {/* Tagline for "full" variant */}
          {isFull && (
            <g transform="translate(0, 82)">
              <line
                x1="0"
                y1="0"
                x2="42"
                y2="0"
                stroke={`url(#npCyanH_${variant})`}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`url(#npNeonH_${variant})`}
              />
              <text
                x="54"
                y="5"
                fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
                fontSize="13.5"
                fontWeight="700"
                fill={taglineColor}
                letterSpacing="4.5"
                className="np-tagline-text"
              >
                SMART PARKING SYSTEM
              </text>
              <line
                x1="305"
                y1="0"
                x2="340"
                y2="0"
                stroke={`url(#npCyanH_${variant})`}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`url(#npNeonH_${variant})`}
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
