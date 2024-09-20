import useAudioCache from "@/utils/useAudioCache";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import styles from "./AudioPlayer.module.scss";

const AUDIO_PROGRESS_INDICATOR_MULTIPLIER = 10000;

const transformSecondsToTimeString = (seconds: number | undefined) => {
  if (!seconds) return "0:00";

  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(1, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const AudioPlayerWithCache: React.FC<{ audioURL: string }> = ({ audioURL }) => {
  const cachedAudioUrl: any = useAudioCache(audioURL);
  const audioRef: MutableRefObject<HTMLAudioElement | null> = useRef(null);

  const handleClickPlay = () => {
    if (isAudioPlaying) {
      audioRef.current?.pause();
      return;
    }
    audioRef.current?.play();
  };

  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDurationString, setAudioDurationString] = useState(
    transformSecondsToTimeString(0)
  );
  const handleClearCache = async () => {
    const cacheName = "audio-cache";
    const cache = await caches.open(cacheName);
    await cache.delete(audioURL);
  };

  const audioReadyHandler = () => {
    setAudioCurrentTime(audioRef.current?.currentTime!);

    // Sometime actual audio duration is more than the recorder duration due to delay in recorder stopping the audio record
    if (isFinite(audioRef.current?.duration!) && audioRef.current?.duration!) {
      const updatedDuration = Math.ceil(audioRef.current?.duration!);
      setAudioDurationString(transformSecondsToTimeString(updatedDuration));
    }
  };

  const audioSeekHandler = (seekTime: number) => {
    if (audioRef.current?.currentTime) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const audioTimeUpdateHandler = () => {
    setAudioCurrentTime(audioRef.current?.currentTime!);
  };

  return (
    <div>
      <audio
        ref={audioRef}
        src={cachedAudioUrl}
        preload="metadata"
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        onLoadedMetadata={audioReadyHandler}
        onTimeUpdate={audioTimeUpdateHandler}
      />
      <input
        type="range"
        aria-hidden="true"
        className={styles.seek}
        onChange={(event) => {
          audioSeekHandler(
            Math.floor(
              +event.target.value / AUDIO_PROGRESS_INDICATOR_MULTIPLIER
            )
          );
        }}
        value={Math.floor(
          audioCurrentTime * AUDIO_PROGRESS_INDICATOR_MULTIPLIER
        )}
        min="0"
        max={
          Math.floor(audioRef.current?.duration!) *
            AUDIO_PROGRESS_INDICATOR_MULTIPLIER ||
          AUDIO_PROGRESS_INDICATOR_MULTIPLIER
        }
      />
      <button onClick={handleClickPlay}>
        {isAudioPlaying ? "Pause" : "Play"}
      </button>
      <div>
        <button onClick={handleClearCache} className={styles.button}>
          Clear Cache
        </button>
      </div>
    </div>
  );
};

export default AudioPlayerWithCache;
