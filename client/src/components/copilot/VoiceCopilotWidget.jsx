import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Maximize2,
  Mic,
  Minimize2,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Button from "../ui/Button";
import ReportPreviewCard from "../reports/ReportPreviewCard";
import { handleCopilotChat } from "../../lib/reportsData";
import { voiceAssistant } from "../../lib/voiceAssistant";

export default function VoiceCopilotWidget() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your **AI Voice Command & Report Copilot**. You can speak or type to request compliance reports (e.g., *SOC 2 Gap Report*, *High-Risk Evidence*, *Audit Trail*), navigate the workspace, or query metrics.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend = input, isVoice = false) => {
    const query = textToSend.trim();
    if (!query) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      isVoice,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTranscriptPreview("");

    // Process with Copilot engine
    setTimeout(() => {
      const result = handleCopilotChat(query, navigate);

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: result.text,
        report: result.report,
        type: result.type,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak result if voice synthesis enabled
      if (result.speech && !isMuted) {
        voiceAssistant.speak(result.speech);
      }
    }, 400);
  };

  const toggleListening = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      setTranscriptPreview("");
      return;
    }

    const started = voiceAssistant.startListening({
      onStart: () => {
        setIsListening(true);
      },
      onResult: ({ transcript, isFinal }) => {
        setTranscriptPreview(transcript);
        if (isFinal) {
          setIsListening(false);
          handleSendMessage(transcript, true);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setTranscriptPreview("");
        console.warn("Speech recognition error:", err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      alert("Microphone or speech recognition is not supported in this browser. You can type commands instead.");
    }
  };

  const toggleMute = () => {
    const muted = voiceAssistant.toggleMute();
    setIsMuted(muted);
  };

  const quickPrompts = [
    "Financial Report",
    "Employees Details Report",
    "Total Investment Report",
    "SOC 2 Gap Report",
    "High-Risk Evidence Summary",
    "October Audit Trail Export",
    "HIPAA Security Safeguards",
    "ISO 27001 Surveillance Report",
  ];

  return (
    <>
      {/* Floating Launcher Pill */}
      {!isOpen ? (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 shadow-xl ${
              isListening
                ? "border-rose-400 bg-rose-500/20 text-rose-300 animate-pulse ring-4 ring-rose-500/20"
                : "border-accent/40 bg-surface/90 text-accent hover:scale-105 hover:bg-shell hover:border-accent shadow-accent/10"
            }`}
            title={isListening ? "Listening... click to stop" : "Click to speak voice command"}
            aria-label="Activate voice command"
          >
            {isListening ? <Mic size={22} className="animate-pulse" /> : <Mic size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex h-12 items-center gap-3 rounded-2xl border border-accent/40 bg-surface/90 px-4 py-2.5 text-xs font-semibold text-slate-100 shadow-xl shadow-black/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-accent hover:bg-shell"
            aria-label="Open AI Copilot and Report Generator"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent group-hover:scale-105 transition-transform">
              <Sparkles size={15} />
            </span>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold leading-none text-ink">AI Copilot</span>
              <span className="block text-[10px] font-medium text-accent">Voice & Reports</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          </button>
        </div>
      ) : null}

      {/* Slide-out / Floating Copilot Panel */}
      {isOpen ? (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col overflow-hidden rounded-2xl border border-accent/30 bg-void/95 shadow-2xl shadow-black/80 backdrop-blur-2xl ${
            isExpanded
              ? "inset-4 sm:inset-10"
              : "bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[480px] h-[640px] max-h-[calc(100vh-32px)]"
          }`}
          role="dialog"
          aria-label="AI Voice Command & Report Copilot"
        >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line/80 bg-shell/80 px-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent shadow-sm">
                <Bot size={17} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                    AI Reports & Voice Copilot
                  </h3>
                  <span className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[9px] font-semibold text-accent">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Instant reports, navigation & audit Q&A
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                className={`rounded-lg p-1.5 transition-colors ${
                  isMuted ? "text-slate-500 hover:text-slate-300" : "text-accent hover:bg-shell"
                }`}
                title={isMuted ? "Unmute voice output" : "Mute voice output"}
                aria-label={isMuted ? "Unmute voice output" : "Mute voice output"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block rounded-lg p-1.5 text-slate-400 hover:bg-shell hover:text-ink transition-colors"
                title={isExpanded ? "Collapse window" : "Expand window"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsListening(false);
                  voiceAssistant.stopListening();
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-shell hover:text-ink transition-colors"
                aria-label="Close copilot"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="shrink-0 overflow-x-auto border-b border-line/60 bg-shell/40 px-3 py-2 no-scrollbar">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 shrink-0 mr-1">
                Prompts:
              </span>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap rounded-lg border border-line bg-surface/70 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-accent/40 hover:bg-raised hover:text-accent transition-all shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500">
                  <span>{msg.sender === "user" ? "You" : "AI Copilot"}</span>
                  {msg.isVoice ? (
                    <span className="inline-flex items-center gap-0.5 text-rose-300">
                      <Mic size={10} /> Voice
                    </span>
                  ) : null}
                  <span>· {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-accent/15 text-slate-100 border border-accent/30 rounded-tr-sm"
                      : "bg-surface/80 text-slate-200 border border-line rounded-tl-sm shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Structured Report Card Attachment */}
                {msg.report ? (
                  <div className="w-full mt-2">
                    <ReportPreviewCard report={msg.report} />
                  </div>
                ) : null}
              </div>
            ))}

            {/* Listening indicator */}
            {isListening ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-pulse">
                <Mic size={16} className="shrink-0 animate-bounce" />
                <div>
                  <p className="font-semibold">Listening to your voice command...</p>
                  <p className="text-[11px] text-slate-400">
                    {transcriptPreview || "Speak naturally, e.g., 'Generate SOC 2 gap report' or 'Go to financials'"}
                  </p>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="shrink-0 border-t border-line/80 bg-shell/90 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isListening
                    ? "border-rose-400 bg-rose-500/20 text-rose-300 animate-pulse"
                    : "border-line bg-surface text-slate-300 hover:border-accent hover:text-accent"
                }`}
                title={isListening ? "Stop listening" : "Click to speak"}
                aria-label={isListening ? "Stop listening" : "Click to speak"}
              >
                {isListening ? <Mic size={18} /> : <Mic size={18} />}
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask for a report, metric, or navigation..."}
                className="h-10 flex-1 rounded-xl border border-line bg-surface px-3 text-xs text-ink placeholder:text-slate-500 focus:border-accent/60 focus:outline-none"
              />

              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={!input.trim()}
                className="h-10 px-3.5"
                title="Send command"
              >
                <Send size={14} />
              </Button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Web Speech API active (Voice-in & Voice-out)</span>
              <span>Try "Generate SOC 2 gap report"</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
