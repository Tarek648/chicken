import React, { useEffect, useRef, useState } from "react";
import "./PrankPage.css";

const prankSong = {
  title: "Chicken Anthem",
  emoji: "🐔🎶",
  url: "/songs/chicken.mpeg", // Make sure this file exists in public/songs/
};

export default function PrankPage() {
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);

  // Handle user interaction
  const handleUserClick = async () => {
    setUserInteracted(true);
    try {
      // Force maximum volume
      if (audioRef.current) {
        audioRef.current.volume = 1.0; // Max volume (1.0)
        audioRef.current.muted = false;
      }

      // Try to enter fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // Try to auto-play the audio
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsSongPlaying(true);
              // Continuously force volume (in case user tries to lower it)
              const volumeCheck = setInterval(() => {
                if (audioRef.current) {
                  audioRef.current.volume = 1.0;
                  audioRef.current.muted = false;
                }
              }, 500);
              return () => clearInterval(volumeCheck);
            })
            .catch(error => {
              console.log("Auto-play prevented:", error);
              setShowWarning(true);
            });
        }
      }

      // Prevent back button
      window.history.pushState(null, "", window.location.href);
    } catch (err) {
      console.warn("Prank initialization failed:", err);
      setShowWarning(true);
    }
  };

  // Lock the user on the page
  useEffect(() => {
    if (!isSongPlaying) return;

    const preventExit = (e) => {
      e.preventDefault();
      e.returnValue = "🐔 Hold on! The chicken is not done yet.";
      return "🐔 Hold on! The chicken is not done yet.";
    };

    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
      alert("🚫 Sit tight! The chicken has something to say.");
    };

    const blockKeys = (e) => {
      const blocked = ["F5", "F11", "Escape"];
      const comboKeys = ["r", "R", "w", "W", "t", "T"];
      const volumeKeys = ["ArrowUp", "ArrowDown", "m", "M"];
      
      if (
        blocked.includes(e.key) ||
        (e.ctrlKey && comboKeys.includes(e.key)) ||
        (e.metaKey && comboKeys.includes(e.key)) ||
        volumeKeys.includes(e.key)
      ) {
        e.preventDefault();
        alert("🐔 No cheating! Let the chicken finish!");
      }
    };

    window.addEventListener("beforeunload", preventExit);
    window.addEventListener("popstate", handleBack);
    window.addEventListener("keydown", blockKeys);

    return () => {
      window.removeEventListener("beforeunload", preventExit);
      window.removeEventListener("popstate", handleBack);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [isSongPlaying]);

  return (
    <div className="prank-container" onClick={!userInteracted ? handleUserClick : undefined}>
      <div className="prank-content">
        {!userInteracted ? (
          <div className="click-prompt">
            <h1>Click anywhere to start the chicken prank! {prankSong.emoji}</h1>
            <p>Warning: You won't be able to leave until it's done!</p>
          </div>
        ) : (
          <>
            <h1>{prankSong.emoji} Now Playing: {prankSong.title} {prankSong.emoji}</h1>
            
            <audio
              ref={audioRef}
              autoPlay
              loop={false}
              volume={1.0}
              onVolumeChange={(e) => {
                // Immediately reset volume if changed
                e.target.volume = 1.0;
                e.target.muted = false;
              }}
              onEnded={() => {
                setIsSongPlaying(false);
                alert("🎉 Okay... you're free now. But the chicken lives on.");
              }}
            >
              <source src={prankSong.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            {showWarning && (
              <div className="warning">
                <p>⚠️ Couldn't auto-play the song. Click play manually!</p>
                <p>The prank won't work properly unless you play it.</p>
              </div>
            )}

            <div className="chicken-animation">
              <div className="chicken">🐔</div>
              <div className="music-notes">🎵 🎶 🎵</div>
            </div>

            <p className="lock-message">
              🔒 Volume locked at maximum! No escape until the song ends!
            </p>
          </>
        )}
      </div>
    </div>
  );
}