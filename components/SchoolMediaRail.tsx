"use client";

import { useEffect, useRef, useState } from "react";
import { HouseScoreboard } from "@/components/HouseScoreboard";
import { Icon } from "@/components/Icon";
import { schoolMedia } from "@/lib/config";

const slideMs = 6000;

/**
 * Side panel of school life: a muted looping video when one is configured,
 * otherwise a slow cross-fade through school photographs. Motion stops for
 * people who ask for reduced motion, and can be paused at any time.
 */
export function SchoolMediaRail() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photos = schoolMedia.photos;
  const hasVideo = Boolean(schoolMedia.videoUrl);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  useEffect(() => {
    if (hasVideo || paused || photos.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % photos.length),
      slideMs
    );
    return () => window.clearInterval(timer);
  }, [hasVideo, paused, photos.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else void video.play().catch(() => undefined);
  }, [paused]);

  return (
    <aside className="media-rail" aria-label="School life">
      <div className="media-frame">
        {hasVideo ? (
          <video
            ref={videoRef}
            src={schoolMedia.videoUrl}
            poster={schoolMedia.posterUrl}
            autoPlay={!paused}
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : (
          photos.map((photo, photoIndex) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.src}
              src={photo.src}
              alt=""
              className={photoIndex === index ? "active" : ""}
            />
          ))
        )}
        <div className="media-overlay">
          {!hasVideo && <span className="media-caption">{photos[index]?.caption}</span>}
          <button
            type="button"
            className="icon-button small media-toggle"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Play school pictures" : "Pause school pictures"}
            title={paused ? "Play" : "Pause"}
          >
            <Icon name={paused ? "resume" : "pause"} size={16} />
          </button>
        </div>
      </div>
      <div className="media-houses">
        <HouseScoreboard compact />
      </div>
    </aside>
  );
}
