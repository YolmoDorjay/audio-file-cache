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
              "https://d18c9huj2okvr.cloudfront.net/5d5a7ea2-cca9-482a-ab9a-b77bc5130614/Public/Courses/19513a1a-4d2e-4824-a23c-749805b774cc/sample-15s.mp3"
            }
          />
        )}
      </div>
    </div>
  );
};

export default ArrayBufferPage;
