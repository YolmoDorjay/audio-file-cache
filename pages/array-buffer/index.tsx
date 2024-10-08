import React, { MutableRefObject, useEffect, useState, useRef } from "react";
import styles from "../../components/AudioPlayer.module.scss";
import ArrayBufferPlayer from "@/components/ArrayBufferPlayer";

const ArrayBufferPage = () => {
  const [showAudioDrawer, setShowAudioDrawer] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAudioDrawer((prev) => !prev)}>
        Play Audio
      </button>
      <div className={styles.description}>
        {showAudioDrawer && (
          <ArrayBufferPlayer
            sourceLink={
              "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            }
          />
        )}
      </div>
    </div>
  );
};

export default ArrayBufferPage;
