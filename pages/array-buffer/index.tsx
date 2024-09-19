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
              "https://onlinetestcase.com/wp-content/uploads/2023/06/2-MB-MP3.mp3"
            }
          />
        )}
      </div>
    </div>
  );
};

export default ArrayBufferPage;
