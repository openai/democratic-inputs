import React, { useEffect, useState } from "react"

const ScrollProgressCircle: React.FC = () => {
  const [progress, setProgress] = useState(0)
  const radius = 12 // Half of the width and height of SVG circle.
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollPosition = window.scrollY

      setProgress((scrollPosition / totalHeight) * 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate the stroke-dashoffset based on the progress.
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 lg:bottom-14 lg:right-14">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle
          cx="14"
          cy="14"
          r={radius}
          strokeWidth="2"
          stroke="#0ea5e9"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90, 14, 14)"
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: offset,
          }}
        />
      </svg>
    </div>
  )
}

export default ScrollProgressCircle
