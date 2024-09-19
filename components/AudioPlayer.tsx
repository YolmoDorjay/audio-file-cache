import { MutableRefObject, useEffect, useRef, useState } from "react";
import styles from "./AudioPlayer.module.scss";
import { storeAudioFile, retrieveAudioFile } from "../utils/indexDb";
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

const AudioPlayer = ({ sourceLink }: { sourceLink: string }) => {
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
    if (audioRef.current) audioRef.current?.play();

    return () => {
      audioRef.current?.pause();
    };
  }, [audioUrl]);

  useEffect(() => {
    const fetchAndCacheAudio = async () => {
      try {
        const cachedAudio: any = await localforage.getItem(audioKey);
        if (cachedAudio) {
          const audioBlobUrl = URL.createObjectURL(cachedAudio);
          setAudioUrl(audioBlobUrl);
          console.log("Audio received from cached");
        } else {
          const response = await fetch(sourceLink);
          const audioBlob = await response.blob();
          await localforage.setItem(audioKey, audioBlob);

          const audioBlobUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioBlobUrl);
          console.log("Audio received from API");
        }
      } catch (error) {
        console.error("Error fetching or caching audio:", error);
      }
    };

    fetchAndCacheAudio();
  }, []);

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
      <div>
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
    </div>
  );
};

export default AudioPlayer;
