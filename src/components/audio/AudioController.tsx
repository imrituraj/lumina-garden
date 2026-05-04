import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useStore } from '../../store/useStore';

const AudioController: React.FC = () => {
  const { activeQuizSubjectId } = useStore();
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Initialize the ambient lo-fi loop
    soundRef.current = new Howl({
      src: ['https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'], // Placeholder lo-fi track
      loop: true,
      volume: 0.3,
      html5: true, // Force HTML5 Audio to allow playing large files
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  useEffect(() => {
    if (!soundRef.current) return;

    if (activeQuizSubjectId) {
      // Play only when quiz is active
      if (!soundRef.current.playing()) {
        soundRef.current.play();
        soundRef.current.fade(0, 0.3, 1000); // Fade in
      }
    } else {
      // Stop or pause when quiz ends
      if (soundRef.current.playing()) {
        soundRef.current.fade(0.3, 0, 1000); // Fade out
        setTimeout(() => {
          if (soundRef.current) soundRef.current.pause();
        }, 1000);
      }
    }
  }, [activeQuizSubjectId]);

  return null; // Invisible component
};

export default AudioController;
