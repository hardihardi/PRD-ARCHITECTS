import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Mic permission denied. Please allow microphone access.");
        } else {
          setErrorMsg(`Error: ${event.error}`);
        }
        setIsRecording(false);
        setTimeout(() => setErrorMsg(""), 5000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setErrorMsg("");
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  if (!recognitionRef.current && typeof window !== "undefined") {
    // @ts-ignore
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      return null; // Not supported
    }
  }

  return (
    <div className="relative group inline-block">
      <button
        onClick={toggleRecording}
        title={isRecording ? "Stop dictation" : "Start dictation"}
        className={`p-1.5 rounded-md transition-colors ${
          isRecording
            ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
            : errorMsg
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
        }`}
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>
      {errorMsg && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-normal text-center">
          {errorMsg}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
