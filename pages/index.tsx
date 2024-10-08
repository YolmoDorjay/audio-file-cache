import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import AudioPlayerWithCache from "@/components/AudioPlayerWithCache";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Audio Player</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <AudioPlayerWithCache audioURL="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
        </div>
      </main>
    </>
  );
}
