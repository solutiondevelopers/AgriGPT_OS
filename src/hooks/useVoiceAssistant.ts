import { useCallback, useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '../contexts/LanguageContext';

type VoiceLocale = 'en-IN' | 'hi-IN' | 'mr-IN';

const localeFor = (language: LanguageCode): VoiceLocale => {
  if (language === 'hi') return 'hi-IN';
  if (language === 'mr') return 'mr-IN';
  return 'en-IN';
};

const cleanForSpeech = (value: string) => value
  .replace(/```[\s\S]*?```/g, '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_#>`]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** Browser-native speech recognition and synthesis for AgriGPT. */
export function useVoiceAssistant(language: LanguageCode, onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceLocale, setVoiceLocale] = useState<VoiceLocale>(() => localeFor(language));
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    if (!isListening) setVoiceLocale(localeFor(language));
  }, [language, isListening]);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const selectVoiceLocale = useCallback((locale: VoiceLocale) => {
    setVoiceLocale(locale);
    if (recognitionRef.current) recognitionRef.current.lang = locale;
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    const browserWindow = window as any;
    const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please use the latest Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLocale;
    recognition.continuous = false;
    recognition.interimResults = true;
    transcriptRef.current = '';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let transcript = '';
      let hasFinalResult = false;
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? '';
        hasFinalResult = hasFinalResult || Boolean(event.results[i].isFinal);
      }
      transcriptRef.current = transcript.trim();
      onTranscript(transcriptRef.current);
      if (hasFinalResult && transcriptRef.current) {
        window.dispatchEvent(new CustomEvent('agrigpt-voice-command', {
          detail: { transcript: transcriptRef.current }
        }));
      }
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone permission was denied. Allow microphone access in your browser settings and try again.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Voice input failed: ${event.error}. Please try again.`);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setError('Voice input is already starting. Please try again.'); }
  }, [onTranscript, voiceLocale]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening(); else startListening();
  }, [isListening, startListening, stopListening]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((value: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Read-aloud is not supported in this browser.');
      return;
    }
    const text = cleanForSpeech(value);
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLocale;
    const voice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith(voiceLocale.slice(0, 2).toLowerCase()));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => { setIsSpeaking(false); setError('Could not read that response aloud.'); };
    window.speechSynthesis.speak(utterance);
  }, [voiceLocale]);

  useEffect(() => () => {
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    window.speechSynthesis?.cancel();
  }, []);

  return { isListening, isSpeaking, error, clearError: () => setError(null), voiceLocale, setVoiceLocale: selectVoiceLocale, toggleListening, stopListening, speak, stopSpeaking };
}
