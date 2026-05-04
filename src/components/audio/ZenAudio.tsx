import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../../store/useStore';

const RAIN_URL = 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_82c68636b0.mp3?filename=rain-on-a-tin-roof-8959.mp3';
const THUNDER_URL = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=heavy-thunder-14-11323.mp3';
const LOFI_URL = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

const ZenAudio: React.FC = () => {
  const { weatherState, isMuted, toggleMute, activeQuizSubjectId } = useStore();
  
  const lofiRef = useRef<Howl | null>(null);
  const rainRef = useRef<Howl | null>(null);
  const thunderRef = useRef<Howl | null>(null);
  const thunderIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Initialize Sounds
    lofiRef.current = new Howl({ src: [LOFI_URL], loop: true, volume: 0, html5: true });
    rainRef.current = new Howl({ src: [RAIN_URL], loop: true, volume: 0, html5: true });
    thunderRef.current = new Howl({ src: [THUNDER_URL], loop: false, volume: 0, html5: true });

    return () => {
      lofiRef.current?.unload();
      rainRef.current?.unload();
      thunderRef.current?.unload();
      if (thunderIntervalRef.current) clearInterval(thunderIntervalRef.current);
    };
  }, []);

  // Global Mute Handler
  useEffect(() => {
    Howler.mute(isMuted);
  }, [isMuted]);

  // Quiz Lofi Logic
  useEffect(() => {
    if (!lofiRef.current) return;
    if (activeQuizSubjectId) {
      if (!lofiRef.current.playing()) lofiRef.current.play();
      lofiRef.current.fade(0, 0.3, 2000);
    } else {
      lofiRef.current.fade(0.3, 0, 2000);
      setTimeout(() => lofiRef.current?.pause(), 2000);
    }
  }, [activeQuizSubjectId]);

  // Weather Ambient Logic
  useEffect(() => {
    if (!rainRef.current || !thunderRef.current) return;

    if (weatherState === 'RAINY' || weatherState === 'THUNDER') {
      if (!rainRef.current.playing()) rainRef.current.play();
      rainRef.current.fade(0, 0.3, 3000);
    } else {
      rainRef.current.fade(0.3, 0, 3000);
      setTimeout(() => rainRef.current?.pause(), 3000);
    }

    if (weatherState === 'THUNDER') {
      const playThunder = () => {
        if (!thunderRef.current) return;
        thunderRef.current.volume(0.4 + Math.random() * 0.4);
        thunderRef.current.play();
        const nextThunder = 15000 + Math.random() * 20000; // Random 15-35s
        thunderIntervalRef.current = setTimeout(playThunder, nextThunder);
      };
      // Start initial thunder
      thunderIntervalRef.current = setTimeout(playThunder, 5000);
    } else {
      if (thunderIntervalRef.current) clearTimeout(thunderIntervalRef.current);
    }

    return () => {
      if (thunderIntervalRef.current) clearTimeout(thunderIntervalRef.current);
    };
  }, [weatherState]);

  return (
    <button 
      onClick={toggleMute}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/40 transition-all duration-300"
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
};

export default ZenAudio;
