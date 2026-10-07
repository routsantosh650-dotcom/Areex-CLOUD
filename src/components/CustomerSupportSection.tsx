import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Headphones,
  Send,
  ExternalLink,
  X,
  RotateCcw,
  MessageCircleQuestion,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  showDiscordCta?: boolean;
  timestamp: string;
}

interface CustomerSupportChatProps {
  discordUrl: string;
  open: boolean;
  onToggleOpen: (open: boolean) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'bot',
    text: 'Hey! 👋 Welcome to Areex Cloud 24/7 Support. Ask me any normal doubts about our plans, RAM, ping, or payment methods!\n\n(Note: Agar koi problem, server issue, ya refund ki baat karni ho, toh humare Official Discord par baat karein.)',
    showDiscordCta: false,
    timestamp: 'Just now',
  },
];

const QUICK_DOUBTS = [
  'Plans & Pricing?',
  'Best plan for SMP / Modpacks?',
  'UPI & Coupon Codes?',
  'Mumbai Ping & Hardware?',
  'Refund / Server Problem',
];

function generateSupportReply(input: string): {
  text: string;
  showDiscordCta: boolean;
} {
  const q = input.toLowerCase().trim();

  // 1. Check if it's a Problem, Refund, Billing Issue, Crash, Lag Complaint, or Migration
  const problemOrRefundKeywords = [
    'refund',
    'problem',
    'issue',
    'cancel',
    'money back',
    'return',
    'crash',
    'not working',
    'error',
    'bug',
    'dikkat',
    'kharab',
    'paisa',
    'wapas',
    'payment fail',
    'deducted',
    'stuck',
    'down',
    'lagging',
    'ticket',
    'migration',
    'migrate',
    'transfer',
    'complaint',
    'password lost',
    'login issue',
  ];

  if (problemOrRefundKeywords.some((kw) => q.includes(kw))) {
    return {
      text: 'Agar aapko **Refund, Billing Problem, Server Issue, ya Free World Migration** ke baare mein baat karni hai, toh please humare **Official Discord** par aake Support Ticket open karein. Humari team wahan aapse direct baat karke turant solve kar degi!',
      showDiscordCta: true,
    };
  }

  // 2. Normal Doubts: Plans & Pricing
  if (
    q.includes('plan') ||
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('cost') ||
    q.includes('kitne') ||
    q.includes('rate') ||
    q.includes('cheap') ||
    q.includes('budget')
  ) {
    return {
      text: 'Humare paas 6 plan categories hain:\n• **Bot Plans:** ₹29/mo se shuru\n• **Budget Minecraft:** ₹69/mo (4GB) se ₹449/mo (32GB)\n• **Premium Plans:** ₹399/mo (24GB) se ₹2,499/mo (256GB)\n• **VPS Plans:** ₹149/mo se ₹1,999/mo\n• **Exclusive Ryzen 9 9950X:** ₹1,499/mo se\n• **Domains (.in / .com / .gg):** ₹449/yr se!',
      showDiscordCta: false,
    };
  }

  // 3. Normal Doubts: Best Plan for SMP / Modpacks / Players
  if (
    q.includes('smp') ||
    q.includes('modpack') ||
    q.includes('rlcraft') ||
    q.includes('atm9') ||
    q.includes('best') ||
    q.includes('player') ||
    q.includes('ram') ||
    q.includes('konsa')
  ) {
    return {
      text: '• **Small Friends SMP (5–15 players):** Budget **Max (8GB RAM - ₹129/mo)** ya **Titan (12GB - ₹199/mo)** best hai.\n• **Heavy Modpacks (RLCraft, ATM9) & Big Networks:** Premium **Elite (24GB - ₹399/mo)** ya **Elite Plus (32GB - ₹499/mo)** choose karein for lag-free 20 TPS!',
      showDiscordCta: false,
    };
  }

  // 4. Normal Doubts: Payment Methods & Coupon Codes
  if (
    q.includes('upi') ||
    q.includes('pay') ||
    q.includes('coupon') ||
    q.includes('promo') ||
    q.includes('discount') ||
    q.includes('code') ||
    q.includes('gpay') ||
    q.includes('phonepe') ||
    q.includes('buy')
  ) {
    return {
      text: 'Aap website par **Razorpay (UPI, GPay, PhonePe, Paytm, Cards & NetBanking)** se direct payment kar sakte hain. Checkout me aap **AREEX10** ya **INDIA20** (aur koi bhi active coupon code) lagake instant discount le sakte hain! Payment ke 60 seconds me server ready ho jata hai.',
      showDiscordCta: false,
    };
  }

  // 5. Normal Doubts: Ping, Location, Hardware, DDoS
  if (
    q.includes('ping') ||
    q.includes('location') ||
    q.includes('mumbai') ||
    q.includes('india') ||
    q.includes('cpu') ||
    q.includes('hardware') ||
    q.includes('ddos') ||
    q.includes('ryzen')
  ) {
    return {
      text: 'Humare servers **Mumbai (4ms ping)**, **Noida (9ms ping)**, aur **Singapore (28ms ping)** datacenters me hosted hain, powered by **AMD Ryzen 9 9950X & AMD EPYC** processors, NVMe SSDs, aur 24/7 Enterprise DDoS protection!',
      showDiscordCta: false,
    };
  }

  // 6. Normal Doubts: VPS, Root Access, Discord Bots, Domains
  if (
    q.includes('vps') ||
    q.includes('root') ||
    q.includes('ssh') ||
    q.includes('bot') ||
    q.includes('domain')
  ) {
    return {
      text: 'Yes! **VPS Plans (₹149/mo+)** me aapko full Root SSH access aur KVM virtualization milta hai. **Bot Plans (₹29/mo+)** Node.js, Python aur Java bots ke liye 24/7 online rehte hain. Aur **Domain Plans** me auto Minecraft SRV setup milta hai.',
      showDiscordCta: false,
    };
  }

  // 7. Greetings
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.includes('namaste') ||
    q.includes('bhai') ||
    q.includes('kaise ho')
  ) {
    return {
      text: 'Hello bhai! 👋 Main Areex Cloud 24/7 Support Assistant hoon. Aap mujhse Plans, RAM, Ping, UPI Payment, ya Coupons ke baare me koi bhi normal doubt pooch sakte hain. Agar koi problem ya refund ka issue hai toh Discord par baat karein!',
      showDiscordCta: false,
    };
  }

  // 8. Fallback for any other specific/complex query -> answer + guide to Discord
  return {
    text: 'Areex Cloud par sabhi Minecraft, Bot, aur VPS servers 60 seconds me setup ho jate hain (starting ₹29/mo). Agar aapko koi specific **problem aa rahi hai, refund chahiye, ya custom setup karwana hai**, toh please humare **Official Discord** par aake baat karein!',
    showDiscordCta: true,
  };
}

export const CustomerSupportChat: React.FC<CustomerSupportChatProps> = ({
  discordUrl,
  open,
  onToggleOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && chatBoxRef.current) {
      gsap.fromTo(
        chatBoxRef.current,
        { opacity: 0, y: 18, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'power3.out' }
      );
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  const sendQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = generateSupportReply(trimmed);
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: reply.text,
        showDiscordCta: reply.showDiscordCta,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 320);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <>
      {/* Floating Bottom-Right 24/7 Support Chat Trigger Button */}
      <div className="fixed bottom-4 right-3 sm:right-4 z-40">
        <button
          type="button"
          onClick={() => onToggleOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle 24/7 Customer Support Chat"
          className="flex items-center gap-2 rounded-full border border-red-500/60 bg-gradient-to-r from-red-600 to-[#991b1b] px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-transform hover:scale-105 whitespace-nowrap"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <Headphones className="h-4 w-4" />
          <span>24/7 Support Chat</span>
        </button>
      </div>

      {/* Compact Pop-Up 24/7 Support Chat Box */}
      {open && (
        <div
          ref={chatBoxRef}
          role="dialog"
          aria-label="Areex Cloud 24/7 Support Mini Chat"
          className="fixed bottom-18 sm:bottom-20 right-3 sm:right-4 z-50 flex w-[calc(100vw-1.5rem)] max-w-[375px] flex-col overflow-hidden rounded-2xl border border-red-500/45 bg-[#10070b]/95 text-slate-100 shadow-[0_25px_65px_rgba(0,0,0,0.92)] backdrop-blur-xl"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-red-950/80 via-[#19090f] to-[#10070b] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>24/7 SUPPORT · INSTANT DOUBT CHAT</span>
                </div>
                <h3 className="font-display text-sm font-bold text-white">
                  Areex Cloud Help Chat
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages(INITIAL_MESSAGES)}
                title="Reset Chat"
                aria-label="Reset Support Chat"
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleOpen(false)}
                aria-label="Close Support Chat"
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5 max-h-[310px] bg-[#0a0507]/90">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'rounded-br-sm bg-red-600 text-white font-medium'
                      : 'rounded-bl-sm border border-white/10 bg-[#160b10] text-slate-200'
                  }`}
                >
                  {m.text}

                  {/* Direct Discord Button when user asks about a Problem or Refund */}
                  {m.showDiscordCta && (
                    <div className="mt-2.5 border-t border-white/10 pt-2.5">
                      <a
                        href={discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5865F2] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#4752C4]"
                      >
                        <span>Talk on Official Discord</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                <span className="mt-1 px-1 font-mono text-[9px] text-slate-500">
                  {m.sender === 'user' ? 'You' : 'Areex 24/7 Support'} · {m.timestamp}
                </span>
              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#160b10] px-3 py-2 w-fit text-[11px] text-slate-400 font-mono">
                <MessageCircleQuestion className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                <span>Typing reply...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Doubt Pills */}
          <div className="border-t border-white/10 bg-[#0d0609] px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_DOUBTS.map((qText) => (
                <button
                  key={qText}
                  type="button"
                  onClick={() => sendQuestion(qText)}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300 transition-colors hover:border-red-500/50 hover:bg-red-600/15 hover:text-white whitespace-nowrap"
                >
                  {qText}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar + Discord Escalation Footer */}
          <form
            onSubmit={handleFormSubmit}
            className="border-t border-white/10 bg-[#12080d] p-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a doubt (or type 'refund' / 'problem')..."
                aria-label="Ask a doubt in 24/7 support chat"
                className="flex-1 rounded-xl border border-white/15 bg-[#090507] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white transition-colors hover:bg-red-500"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>Problem or Refund? Talk on Discord:</span>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono font-semibold text-[#7289da] hover:underline"
              >
                <span>Join Discord</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
