import React, { useState } from 'react';
import { ArrowUpRight, Copy, Check, Send, CheckCircle2 } from 'lucide-react';

interface ContactSectionProps {
  discordUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  discordUrl,
  youtubeUrl,
  instagramUrl,
}) => {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedPlatform(id);
    setTimeout(() => setCopiedPlatform(null), 1800);
  };

  const handleDirectInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !senderMessage.trim()) return;
    setMessageSent(true);
    setSenderName('');
    setSenderEmail('');
    setSenderMessage('');
  };

  const platforms = [
    {
      id: 'discord',
      name: 'Discord Community',
      handle: 'discord.gg/pV25HWmZwZ',
      description:
        'Join 2,500+ Indian server owners for 24/7 ticket support, instant node status updates, and free server migration help.',
      url: discordUrl,
      buttonText: 'Join Discord Server',
      accentHover: 'hover:border-[#5865F2] hover:shadow-[0_0_40px_rgba(88,101,242,0.25)]',
      btnStyle: 'bg-[#5865F2] hover:bg-[#4752C4] text-white',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-[#5865F2]">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube Channel',
      handle: '@areex_cloud',
      description:
        'Watch Ryzen 9 9950X server benchmarks, modpack setup guides, TPS stress tests, and official Areex Cloud announcements.',
      url: youtubeUrl,
      buttonText: 'Open YouTube Channel',
      accentHover: 'hover:border-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.28)]',
      btnStyle: 'bg-red-600 hover:bg-red-500 text-white',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-red-500">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Official Instagram',
      handle: '@areex_cloud',
      description:
        'Follow @areex_cloud for flash discount codes, community server spotlights, festival giveaways, and behind-the-scenes hardware drops.',
      url: instagramUrl,
      buttonText: 'Follow on Instagram',
      accentHover: 'hover:border-pink-500 hover:shadow-[0_0_40px_rgba(236,72,153,0.25)]',
      btnStyle:
        'bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 hover:opacity-95 text-white',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-pink-500">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="contact-section"
      className="border-t border-white/10 bg-[#0c0609] py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <div className="font-mono text-xs text-red-400">
            OFFICIAL COMMUNITY & DIRECT SUPPORT CHANNELS
          </div>
          <h2
            style={{ textWrap: 'balance' }}
            className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Connect With Areex Cloud Across Every Platform
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
            Click any official platform card below to launch our Discord server, YouTube channel, or Instagram page directly.
          </p>
        </div>

        {/* 3 Official Social Platform Cards with Brand Logos & Direct Launch Buttons */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {platforms.map((p) => (
            <div
              key={p.id}
              data-plan-card
              className={`group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#12090e] p-7 transition-all duration-200 hover:-translate-y-1.5 ${p.accentHover}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#090608] transition-transform duration-200 group-hover:scale-110">
                    {p.icon}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(p.id, p.url)}
                    aria-label={`Copy ${p.name} link`}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 hover:border-white/25 hover:text-white"
                  >
                    {copiedPlatform === p.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="mt-6 font-display text-2xl font-bold text-white">
                  {p.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-red-400">{p.handle}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {p.description}
                </p>
              </div>

              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-xs font-semibold transition-all whitespace-nowrap ${p.btnStyle}`}
              >
                <span>{p.buttonText}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Direct Custom Network / Support Inquiry Bar */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#12090e] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="font-mono text-xs text-red-400">
                CUSTOM NETWORK & MIGRATION DESK
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold text-white">
                Need Custom Bare-Metal or Free World Migration?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Send a direct message to Piyush Garai and the engineering team, or open a priority ticket on our Discord server for instant response.
              </p>
            </div>

            <div className="lg:col-span-7">
              {messageSent ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>
                      Your inquiry has been logged! For fastest 1-minute response, join our official Discord at{' '}
                      <a
                        href={discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-mono text-white"
                      >
                        {discordUrl}
                      </a>
                      .
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMessageSent(false)}
                    className="ml-4 text-xs font-semibold text-white underline whitespace-nowrap"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleDirectInquiry}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your Name / IGN"
                    aria-label="Your Name or Minecraft IGN"
                    className="rounded-xl border border-white/15 bg-[#090608] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Your Email or Discord Tag"
                    aria-label="Your Email or Discord Tag"
                    className="rounded-xl border border-white/15 bg-[#090608] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                  <div className="flex gap-2 sm:col-span-3">
                    <input
                      type="text"
                      required
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      placeholder="Describe your server player count, modpack, or migration request..."
                      aria-label="Your Inquiry Message"
                      className="flex-1 rounded-xl border border-white/15 bg-[#090608] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 whitespace-nowrap"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
