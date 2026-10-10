import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

type Command =
  | { kind: 'navigate'; path: string; label: string }
  | { kind: 'store-product'; query: string; label: string };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s+-]/g, ' ').replace(/\s+/g, ' ').trim();

function commandFromTranscript(transcript: string): Command | null {
  const value = normalize(transcript);
  const wantsStore = /\b(agro ?store|store|shop|marketplace)\b/.test(value);
  const productMatch = value.match(/(?:select|show|view|find|choose)\s+(?:the\s+)?(.+?)(?:\s+(?:in|from|on)\s+(?:the\s+)?(?:agro ?store|store|shop))?$/);

  if (wantsStore && productMatch?.[1]) {
    const query = productMatch[1].replace(/\b(product|item|please|and)\b/g, '').trim();
    if (query) return { kind: 'store-product', query, label: `Opening AgroStore and selecting “${query}”` };
  }
  if (wantsStore) return { kind: 'navigate', path: '/store', label: 'Opening AgroStore' };
  if (/\b(weather|forecast)\b/.test(value)) return { kind: 'navigate', path: '/weather', label: 'Opening Weather' };
  if (/\b(disease|scan|plant health)\b/.test(value)) return { kind: 'navigate', path: '/scan', label: 'Opening Disease Scan' };
  if (/\b(analytics|reports?|dashboard)\b/.test(value)) return { kind: 'navigate', path: '/analytics', label: 'Opening Analytics' };
  if (/\b(satellite|field map|pixel farm)\b/.test(value)) return { kind: 'navigate', path: '/satellite', label: 'Opening Satellite View' };
  if (/\b(3d|three d|farm view|digital twin)\b/.test(value)) return { kind: 'navigate', path: '/3d-view', label: 'Opening 3D Farm View' };
  if (/\b(chat|advisor|home)\b/.test(value) && /\b(open|go|show|take|navigate)\b/.test(value)) return { kind: 'navigate', path: '/', label: 'Opening AgriGPT chat' };
  return null;
}

export function VoiceCommandRouter() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleVoiceCommand = (event: Event) => {
      const transcript = (event as CustomEvent<{ transcript?: string }>).detail?.transcript;
      if (!transcript) return;
      const command = commandFromTranscript(transcript);
      if (!command) return;

      if (command.kind === 'store-product') {
        navigate('/store');
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('agrigpt-store-command', {
          detail: { query: command.query }
        })), 50);
      } else {
        navigate(command.path);
      }
      setMessage(command.label);
      window.setTimeout(() => setMessage(null), 4000);
    };

    window.addEventListener('agrigpt-voice-command', handleVoiceCommand);
    return () => window.removeEventListener('agrigpt-voice-command', handleVoiceCommand);
  }, [navigate]);

  if (!message) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl">
      <Mic className="h-4 w-4 text-emerald-400" />
      {message}
    </div>
  );
}
