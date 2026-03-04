import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { ai } from '../lib/gemini';
import { AudioStreamer } from '../lib/audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

export default function LiveAudio() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    try {
      audioStreamerRef.current = new AudioStreamer((base64Data) => {
        if (sessionRef.current) {
          sessionRef.current.then((session: any) => {
            session.sendRealtimeInput({
              media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            });
          });
        }
      });

      await audioStreamerRef.current.startRecording();

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
          },
          onmessage: (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioStreamerRef.current) {
              setIsSpeaking(true);
              audioStreamerRef.current.playAudioChunk(base64Audio);
              // Reset speaking state after a short delay
              setTimeout(() => setIsSpeaking(false), 500);
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a friendly, encouraging productivity coach. Keep your responses brief, conversational, and focused on helping the user take action on their tasks and habits.",
        },
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      setIsConnecting(false);
      disconnect();
    }
  };

  const disconnect = () => {
    if (audioStreamerRef.current) {
      audioStreamerRef.current.stopRecording();
      audioStreamerRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(() => {});
      sessionRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  };

  const toggleConnection = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isConnected && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 mb-4 w-64 bg-card rounded-2xl shadow-xl border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-ai/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-ai" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary">AI Coach</h4>
                <p className="text-xs text-gray-500">Listening...</p>
              </div>
            </div>
            
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-1 h-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isSpeaking ? [10, 30, 10] : [10, 10, 10],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-1.5 bg-ai rounded-full"
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Speak naturally to your coach
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleConnection}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isConnected ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
