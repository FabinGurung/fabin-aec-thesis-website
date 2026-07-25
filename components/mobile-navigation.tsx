"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { sitePath } from "@/components/site-path";

const navItems = [
  ["/", "Overview"],
  ["/research", "Research"],
  ["/system", "Database System"],
  ["/prototype", "Structural Prototype"],
  ["/workflow", "Shared-Data Reuse"],
  ["/graph", "System Graph"],
  ["/evidence", "Evidence"],
  ["/roadmap", "Roadmap"],
  ["/thesis", "Thesis"],
] as const;

export function MobileNavigation() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);

  const updateOverflowCue = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
    setHasMore(remaining > 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const frame = requestAnimationFrame(updateOverflowCue);
    const resizeObserver = new ResizeObserver(updateOverflowCue);
    resizeObserver.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [updateOverflowCue]);

  const handleKeyboardScroll = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: (event.key === "ArrowRight" ? 1 : -1) * Math.max(128, track.clientWidth * 0.56),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <nav className={`primary-nav ${hasMore ? "has-overflow-right" : ""}`} aria-label="Primary navigation">
      <span className="sr-only" id="primary-nav-scroll-help">
        This navigation scrolls horizontally on small screens. Use touch, a trackpad, or the left and right arrow keys while the navigation row is focused.
      </span>
      <div
        className="nav-track"
        ref={trackRef}
        tabIndex={0}
        aria-describedby="primary-nav-scroll-help"
        onScroll={updateOverflowCue}
        onKeyDown={handleKeyboardScroll}
      >
        {navItems.map(([href, label]) => (
          <a href={sitePath(href)} key={href}>
            {label}
          </a>
        ))}
      </div>
      <span className="nav-overflow-cue" aria-hidden="true"><span>›</span></span>
    </nav>
  );
}
