import { useEffect, useState } from "react";

const useAudioCache = (audioUrl: string) => {
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const cacheAudio = async () => {
      const cacheName = "audio-cache";
      const cache = await caches.open(cacheName);

      // Check if audio file is cached
      const cachedResponse = await cache.match(audioUrl);

      if (cachedResponse) {
        const cachedBlob = await cachedResponse.blob();
        setCachedAudioUrl(URL.createObjectURL(cachedBlob));
        console.log("Cached");
      } else {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();

        await cache.put(audioUrl, new Response(audioBlob));
        setCachedAudioUrl(URL.createObjectURL(audioBlob));
        console.log("API");
      }
    };

    cacheAudio();
  }, [audioUrl]);

  return cachedAudioUrl;
};

export default useAudioCache;
