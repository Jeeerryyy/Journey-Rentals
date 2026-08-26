import React, { useState, useRef } from "react";

export default function Tilt3DCard({
  children,
  className = "",
  maxTilt = 10,
  scale = 1.02,
  glare = true,
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
  });

  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25), transparent 60%)",
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized cursor position from center (-1 to 1)
    const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
    const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

    const rotateX = (-mouseY * maxTilt).toFixed(2);
    const rotateY = (mouseX * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "transform 0.1s ease-out",
    });

    if (glare) {
      const glareX = ((e.clientX - rect.left) / width) * 100;
      const glareY = ((e.clientY - rect.top) / height) * 100;
      setGlareStyle({
        opacity: 0.3,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 65%)`,
      });
    }
  };

  const handleMouseEnter = () => {
    setTiltStyle((prev) => ({
      ...prev,
      transition: "transform 0.1s ease-out",
    }));
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
    });
    if (glare) {
      setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...tiltStyle,
      }}
    >
      {children}

      {/* Dynamic 3D Specular Light Glare */}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
          style={glareStyle}
        />
      )}
    </div>
  );
}
