import React, { MutableRefObject, useEffect, useState, useRef } from "react";
import styles from "./AudioPlayer.module.scss";
import localforage from "localforage";

const AUDIO_PROGRESS_INDICATOR_MULTIPLIER = 10000;

const transformSecondsToTimeString = (seconds: number | undefined) => {
  if (!seconds) return "0:00";

  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(1, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const ArrayBufferPlayer = ({ sourceLink }: { sourceLink: string }) => {
  const audioKey = "cachedAudio"; // Key for LocalForage
  const audioRef: MutableRefObject<HTMLAudioElement | null> = useRef(null);

  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDurationString, setAudioDurationString] = useState(
    transformSecondsToTimeString(0)
  );
  const [audioCurrentTimeString, setAudioCurrentTimeString] = useState(
    transformSecondsToTimeString(0)
  );

  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const fetchAndCacheAudio = async () => {
      try {
        // Check if audio is already cached as Array Buffer in LocalForage
        const cachedAudioArrayBuffer: any = await localforage.getItem(audioKey);
        if (cachedAudioArrayBuffer) {
          const audioBlob = new Blob([cachedAudioArrayBuffer], {
            type: "audio/mpeg",
          });
          const audioBlobUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioBlobUrl);
          console.log("Retrieved from localforage as Array Buffer");
        } else {
          // If not cached, fetch audio from API as Array Buffer and store in LocalForage
          const response = await fetch(sourceLink);
          const audioArrayBuffer = await response.arrayBuffer();

          // Cache the ArrayBuffer in LocalForage
          await localforage.setItem(audioKey, audioArrayBuffer);

          // Convert to blob and create a URL for playback
          const audioBlob = new Blob([audioArrayBuffer], {
            type: "audio/mpeg",
          });
          const audioBlobUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioBlobUrl);
          console.log(
            "Retrieved from API and stored in localforage as Array Buffer"
          );
        }
      } catch (error) {
        console.error("Error fetching or caching audio:", error);
      }
    };

    fetchAndCacheAudio();
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current?.play();

    return () => {
      audioRef.current?.pause();
    };
  }, [audioUrl]);

  const audioReadyHandler = () => {
    setAudioCurrentTime(audioRef.current?.currentTime!);

    // Sometime actual audio duration is more than the recorder duration due to delay in recorder stopping the audio record
    if (isFinite(audioRef.current?.duration!) && audioRef.current?.duration!) {
      const updatedDuration = Math.ceil(audioRef.current?.duration!);
      setAudioDurationString(transformSecondsToTimeString(updatedDuration));
    }
  };

  const audioTimeUpdateHandler = () => {
    setAudioCurrentTime(audioRef.current?.currentTime!);
    setAudioCurrentTimeString(
      transformSecondsToTimeString(audioRef.current?.currentTime)
    );
  };

  const audioSeekHandler = (seekTime: number) => {
    if (audioRef.current?.currentTime) {
      audioRef.current.currentTime = seekTime;
    }
  };
  return (
    <div className={styles.audioPlayer}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
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
      <div className={styles.sleekSlider}>
        <span className="body-3">{audioCurrentTimeString}</span>
        <span className="body-3">- {audioDurationString}</span>
      </div>
    </div>
  );
};

export default ArrayBufferPlayer;
