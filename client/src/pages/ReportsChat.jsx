import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Mic,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Panel, { PanelHeader } from "../components/ui/Panel";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ReportPreviewCard from "../components/reports/ReportPreviewCard";
import {
  generateInstantReport,
  handleCopilotChat,
} from "../lib/reportsData";
import { voiceAssistant } from "../lib/voiceAssistant";

export default function ReportsChat() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "assistant",
      text: "Welcome to the **Instant Report Generator Chatbot**! I can generate executive-ready compliance audits, high-risk evidence summaries, and complete audit trail exports across **SOC 2**, **ISO 27001**, **HIPAA**, and **GDPR**.\n\nClick one of the framework templates below, type your prompt, or use your microphone to speak.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "seed-report",
      sender: "assistant",
      text: "Here is your latest scheduled audit compilation for **SOC 2 Type II**:",
      report: generateInstantReport("SOC 2 Type II compliance gap report"),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      if (result.speech && !isMuted) {
        voiceAssistant.speak(result.speech);
      }
    }, 350);
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
      alert("Microphone speech recognition is not supported in this browser. You can type commands instead.");
    }
  };

  const toggleMute = () => {
    const muted = voiceAssistant.toggleMute();
    setIsMuted(muted);
  };

  const reportTemplates = [
    {
      title: "Executive Financial Report",
      desc: "Full 12-month P&L, $2.155M revenue, $1.069M net profit, and 49.6% net margin.",
      prompt: "Generate financial report",
      badge: "P&L Ledger",
      score: "94%",
    },
    {
      title: "Employees Details & Payroll",
      desc: "5 headcount roster, efficiency ratings, base/bonus split, and disbursement status.",
      prompt: "Give me employees details report",
      badge: "People & HR",
      score: "88%",
    },
    {
      title: "Total Investment & CapEx",
      desc: "$4.25M capital deployed, $8.75M valuation, +31.8% blended ROI, and runway.",
      prompt: "Generate total investment report",
      badge: "Treasury",
      score: "91%",
    },
    {
      title: "SOC 2 Gap Analysis",
      desc: "Trust Services Criteria, access recertification & disaster recovery gap report.",
      prompt: "Give me an instant SOC 2 compliance gap report",
      badge: "SOC 2 Type II",
      score: "87%",
    },
    {
      title: "High-Risk Evidence Summary",
      desc: "Catalog of active evidence artifacts, hash integrity, and invalidated proofs.",
      prompt: "Generate high-risk evidence summary",
      badge: "Evidence",
      score: "83%",
    },
    {
      title: "October Audit Trail Export",
      desc: "Immutable chronological log of change simulations and break-glass grants.",
      prompt: "Create an audit trail export for October",
      badge: "Audit Log",
      score: "96%",
    },
    {
      title: "ISO 27001 Surveillance Audit",
      desc: "Annex A controls matrix evaluation across technological & organizational domains.",
      prompt: "Generate ISO 27001 ISMS surveillance audit report",
      badge: "ISO 27001",
      score: "92%",
    },
    {
      title: "HIPAA Technical Safeguards",
      desc: "45 CFR technical safeguards, AES-256 ePHI encryption & access controls.",
      prompt: "Generate HIPAA technical safeguards compliance report",
      badge: "HIPAA",
      score: "94%",
    },
    {
      title: "GDPR Consent & DSAR Audit",
      desc: "Data Protection by Design, Article 30 RoPA records & 30-day DSAR SLA report.",
      prompt: "Generate GDPR data protection and DSAR compliance report",
      badge: "GDPR",
      score: "89%",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Governance & Intelligence"
        title="Instant Report Generator Chatbot"
        description="Generate audit-ready compliance reports, evidence gap summaries, and immutable activity logs using natural language or voice commands. Instant preview, PDF, CSV, and email dispatch included."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                isListening
                  ? "border-rose-400 bg-rose-500/20 text-rose-300 animate-pulse ring-2 ring-rose-400/40"
                  : "border-accent/40 bg-shell/80 text-accent hover:border-accent hover:bg-raised"
              }`}
            >
              <Mic size={15} className={isListening ? "animate-pulse" : ""} />
              <span>{isListening ? "Listening..." : "Voice Command"}</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className={`rounded-xl border border-line p-2 transition-colors ${
                isMuted ? "bg-shell text-slate-500" : "bg-shell/80 text-accent hover:bg-raised"
              }`}
              title={isMuted ? "Unmute assistant voice" : "Mute assistant voice"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        }
      />

      {/* Grid: Left Templates / Right Stream */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Quick Template Launchers */}
        <div className="lg:col-span-4 space-y-4">
          <Panel>
            <PanelHeader
              title="Instant Report Templates"
              description="Click to instantly generate a verified corporate or audit report."
              action={<Badge variant="info">9 Enterprise Reports</Badge>}
            />
            <div className="p-3 space-y-2.5">
              {reportTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(template.prompt)}
                  className="w-full text-left rounded-xl border border-line bg-shell/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-raised/70 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-accent transition-colors">
                      {template.title}
                    </span>
                    <Badge variant="default">{template.badge}</Badge>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    {template.desc}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Readiness: <strong className="text-emerald-300 font-semibold">{template.score}</strong></span>
                    <span className="text-accent group-hover:underline">Compile report →</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {/* Supported Voice Commands Reference Box */}
          <Panel>
            <PanelHeader
              title="Voice & Text Commands"
              description="Sample natural language inputs recognized by the copilot."
            />
            <div className="p-4 space-y-2 text-xs text-slate-300">
              <div className="rounded-lg border border-line bg-void/40 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-accent">Report Generation:</p>
                <p className="mt-0.5 text-slate-400">"Give me a SOC 2 gap report"</p>
                <p className="text-slate-400">"Generate high-risk evidence summary"</p>
                <p className="text-slate-400">"Export October audit trail"</p>
              </div>
              <div className="rounded-lg border border-line bg-void/40 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-accent">Workspace Navigation:</p>
                <p className="mt-0.5 text-slate-400">"Go to financials"</p>
                <p className="text-slate-400">"Open business intelligence"</p>
                <p className="text-slate-400">"Show people and payroll"</p>
              </div>
              <div className="rounded-lg border border-line bg-void/40 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-accent">Compliance Q&A:</p>
                <p className="mt-0.5 text-slate-400">"What is our overall compliance score?"</p>
                <p className="text-slate-400">"Who is the top performing employee?"</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Chat Stream & Interactive Report Workspace */}
        <div className="lg:col-span-8 flex flex-col h-[760px] rounded-2xl border border-line bg-surface overflow-hidden shadow-2xl">
          {/* Stream Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line/80 bg-shell/70 px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent shadow-sm">
                <Bot size={17} />
              </span>
              <div>
                <p className="text-xs font-bold text-ink">Acme Copilot Stream</p>
                <p className="text-[10px] text-slate-400">
                  Continuous multi-framework compliance reasoning
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Speech Synthesis Active
              </span>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">
                    {msg.sender === "user" ? "You" : "Acme Copilot"}
                  </span>
                  {msg.isVoice ? (
                    <span className="inline-flex items-center gap-1 text-rose-300">
                      <Mic size={11} /> Voice Input
                    </span>
                  ) : null}
                  <span>· {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-accent/15 text-slate-100 border border-accent/30 rounded-tr-sm"
                      : "bg-void/70 text-slate-200 border border-line rounded-tl-sm shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Structured Report Card Attachment */}
                {msg.report ? (
                  <div className="w-full mt-3">
                    <ReportPreviewCard report={msg.report} />
                  </div>
                ) : null}
              </div>
            ))}

            {isListening ? (
              <div className="flex items-center gap-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-xs text-rose-300 animate-pulse">
                <Mic size={18} className="shrink-0 animate-bounce" />
                <div>
                  <p className="font-bold">Listening to voice command...</p>
                  <p className="text-xs text-slate-400">
                    {transcriptPreview || "Speak your query, e.g., 'Generate HIPAA compliance report' or 'Go to financials'"}
                  </p>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="shrink-0 border-t border-line/80 bg-shell/80 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isListening
                    ? "border-rose-400 bg-rose-500/20 text-rose-300 animate-pulse"
                    : "border-line bg-void text-slate-300 hover:border-accent hover:text-accent"
                }`}
                title={isListening ? "Stop listening" : "Click to speak voice command"}
              >
                <Mic size={18} />
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Request an instant report or speak a command (e.g., 'Generate SOC 2 gap report')..."}
                className="h-11 flex-1 rounded-xl border border-line bg-void px-4 text-xs text-ink placeholder:text-slate-500 focus:border-accent/60 focus:outline-none"
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!input.trim()}
                className="h-11 px-5"
              >
                <Send size={15} />
                <span>Generate</span>
              </Button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Supports natural voice commands, export to PDF / CSV, and email dispatch</span>
              <span>Ref: SOC 2 · ISO 27001 · HIPAA · GDPR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
