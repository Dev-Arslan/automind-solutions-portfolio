/* ============ Mobile nav ============ */
function toggleMobileNav() {
    document.getElementById('mobile-nav').classList.toggle('open');
}

/* ============ Contact form quick-pick chips ============ */
function pickInterest(value, btn) {
    const select = document.getElementById('interest-select');
    if (!select) return;
    select.value = value;
    document.querySelectorAll('.quick-pick').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
}

/* ============ FAQ accordions ============ */
function toggleFaq(btn) {
    const body = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    body.classList.toggle('open');
    if (icon) icon.style.transform = body.classList.contains('open') ? 'rotate(45deg)' : 'rotate(0deg)';
}

/* ============ Tech / network background ============
   One SVG definition, mounted into every .tech-lines-mount element —
   evokes automation/connectivity without a heavy canvas/particle library. */
const TECH_LINES_SVG = `
<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#60A5FA" stroke-width="1.25" fill="none" opacity="0.55">
        <line x1="80" y1="60" x2="260" y2="140" />
        <line x1="260" y1="140" x2="480" y2="80" />
        <line x1="260" y1="140" x2="220" y2="300" />
        <line x1="480" y1="80" x2="650" y2="180" />
        <line x1="480" y1="80" x2="560" y2="260" />
        <line x1="220" y1="300" x2="420" y2="340" />
        <line x1="560" y1="260" x2="420" y2="340" />
        <line x1="650" y1="180" x2="720" y2="320" />
        <line x1="80" y1="60" x2="150" y2="220" />
        <line x1="150" y1="220" x2="220" y2="300" />
        <line x1="650" y1="180" x2="600" y2="60" />
    </g>
    <g stroke="#8B5CF6" stroke-width="1.75" fill="none" opacity="0.8" stroke-linecap="round">
        <path class="tech-pulse" d="M80 60 L260 140 L480 80 L650 180" stroke-dasharray="8 14" />
        <path class="tech-pulse tech-pulse-2" d="M220 300 L420 340 L560 260 L480 80" stroke-dasharray="6 16" />
        <path class="tech-pulse" d="M150 220 L220 300 L420 340" stroke-dasharray="5 12" style="animation-delay:.6s" />
    </g>
    <g fill="#60A5FA">
        <circle cx="80" cy="60" r="3.5" class="tech-node" style="animation-delay:0s" />
        <circle cx="260" cy="140" r="4" class="tech-node" style="animation-delay:.4s" />
        <circle cx="480" cy="80" r="3.5" class="tech-node" style="animation-delay:.8s" />
        <circle cx="650" cy="180" r="3.5" class="tech-node" style="animation-delay:1.2s" />
        <circle cx="220" cy="300" r="3.5" class="tech-node" style="animation-delay:.2s" />
        <circle cx="420" cy="340" r="3.5" class="tech-node" style="animation-delay:1s" />
        <circle cx="560" cy="260" r="3.5" class="tech-node" style="animation-delay:.6s" />
        <circle cx="720" cy="320" r="3" class="tech-node" style="animation-delay:1.4s" />
        <circle cx="150" cy="220" r="3" class="tech-node" style="animation-delay:1.6s" />
        <circle cx="600" cy="60" r="3" class="tech-node" style="animation-delay:1.8s" />
    </g>
</svg>`;

function mountTechLines() {
    document.querySelectorAll('.tech-lines-mount').forEach(el => { el.innerHTML = TECH_LINES_SVG; });
}

/* ============ Downloads page ============
   Cards are rendered from assets/downloads.json. Download counts are the
   REAL numbers from GitHub's Releases API (asset.download_count) — not
   estimated or fabricated. If the GitHub API call fails or rate-limits,
   the count badge just stays hidden rather than showing a wrong number. */
function loadDownloads() {
    const list = document.getElementById('downloads-list');
    if (!list) return;
    fetch('assets/downloads.json')
        .then(res => res.json())
        .then(items => {
            renderDownloads(items);
            items.forEach(fetchDownloadCount);
        })
        .catch(() => {
            list.innerHTML = '<p class="text-center text-gray-500 text-sm py-10">Downloads list could not be loaded.</p>';
        });
}

function renderDownloads(items) {
    const list = document.getElementById('downloads-list');
    if (!list) return;
    window.DOWNLOADS_DATA = items;
    list.innerHTML = items.map((item, i) => {
        const searchBlob = (item.name + ' ' + item.description).toLowerCase().replace(/"/g, '&quot;');
        return `
        <div class="corner-brackets bg-brand-card border border-gray-800 rounded-xl overflow-hidden card-hover download-card flex flex-col" data-search="${searchBlob}">
            <img src="${item.image}" alt="${item.name}" class="w-full h-32 object-cover border-b border-gray-800" onerror="this.style.display='none'">
            <div class="p-4 flex flex-col flex-1">
                <div class="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span class="text-[10px] font-mono text-gray-500 border border-gray-800 rounded-full px-2 py-0.5">${item.version}</span>
                    <span class="text-[10px] font-mono text-gray-500 border border-gray-800 rounded-full px-2 py-0.5">${item.platform}</span>
                    <span id="dl-count-${i}" class="hidden text-[10px] font-mono text-green-400 border border-green-500/20 bg-green-500/10 rounded-full px-2 py-0.5"><i class="fa-solid fa-download mr-1"></i><span class="count-value"></span></span>
                </div>
                <h2 class="font-display text-sm font-bold text-white mb-1.5">${item.name}</h2>
                <p class="text-gray-400 text-[11px] leading-relaxed mb-3 flex-1">${item.description}</p>
                <button type="button" onclick="triggerDownload(${i})" class="btn-gradient text-white text-xs font-semibold px-4 py-2 rounded-lg text-center">Download <i class="fa-solid fa-arrow-down text-[10px] ml-1"></i></button>
            </div>
        </div>`;
    }).join('');
}

/* Download URL is only resolved on click, from data kept in memory —
   not rendered as a plain href, so it isn't sitting in the visible page
   source or a hover tooltip. It's still visible to anyone inspecting the
   downloads.json network request, which is unavoidable on a static site
   with no backend to proxy the request through. */
function triggerDownload(index) {
    const item = window.DOWNLOADS_DATA && window.DOWNLOADS_DATA[index];
    if (item && item.downloadUrl) window.location.href = item.downloadUrl;
}

function fetchDownloadCount(item, index) {
    if (!item.repoOwner || !item.repoName) return;
    fetch(`https://api.github.com/repos/${item.repoOwner}/${item.repoName}/releases`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(releases => {
            let count = null;
            releases.forEach(rel => {
                (rel.assets || []).forEach(asset => {
                    if (asset.browser_download_url === item.downloadUrl) count = asset.download_count;
                });
            });
            if (count !== null) {
                const badge = document.getElementById('dl-count-' + index);
                if (badge) {
                    badge.querySelector('.count-value').textContent = count.toLocaleString() + ' downloads';
                    badge.classList.remove('hidden');
                }
            }
        })
        .catch(() => { /* API unreachable or rate-limited — badge stays hidden, not wrong */ });
}

function filterDownloads(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.download-card');
    let visibleCount = 0;
    cards.forEach(card => {
        const match = card.dataset.search.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
    });
    const empty = document.getElementById('downloads-empty');
    if (empty) empty.classList.toggle('hidden', visibleCount !== 0 || cards.length === 0);
}

/* ============ Scroll-reveal ============ */
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                const phone = entry.target.querySelector('.wa-demo-phone');
                if (phone) phone.classList.add('wa-demo-playing');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============ Site-wide config (single source of truth) ============
   Edit assets/config.json (or use admin.html to generate it) and every
   page below re-reads it on load — no per-page editing required.
   Note: fetch() of a local JSON file is blocked by the browser on
   file:// — this only works once the site is served over http(s),
   e.g. GitHub Pages. */
function applyConfig(cfg) {
    // Text content bindings: <span data-cfg="email"></span>
    document.querySelectorAll('[data-cfg]').forEach(el => {
        const key = el.getAttribute('data-cfg');
        if (cfg[key]) el.textContent = cfg[key];
    });

    // Href bindings: <a data-cfg-href="email" data-cfg-href-type="mailto"></a>
    document.querySelectorAll('[data-cfg-href]').forEach(el => {
        const key = el.getAttribute('data-cfg-href');
        const type = el.getAttribute('data-cfg-href-type') || 'plain';
        const value = cfg[key];
        if (!value) { el.classList.add('hidden'); return; }
        let href = value;
        if (type === 'mailto') href = 'mailto:' + value;
        if (type === 'tel') href = 'tel:' + value.replace(/[^+\d]/g, '');
        if (type === 'whatsapp') href = 'https://wa.me/' + value.replace(/[^\d]/g, '');
        el.setAttribute('href', href);
        el.classList.remove('hidden');
    });

    // Elements that should hide entirely when a field is empty (no data-cfg-href)
    document.querySelectorAll('[data-cfg-show]').forEach(el => {
        const key = el.getAttribute('data-cfg-show');
        if (!cfg[key]) el.classList.add('hidden');
    });

    window.SITE_CONFIG = cfg;
    document.dispatchEvent(new CustomEvent('config:loaded', { detail: cfg }));
}

function loadConfig() {
    fetch('assets/config.json')
        .then(res => res.json())
        .then(applyConfig)
        .catch(() => {
            // Fallback so the page still renders sensibly if config.json can't be fetched
            applyConfig({ email: 'arslanahmeddev350@gmail.com', phone: '', whatsapp: '', linkedin: '', github: '', location: '' });
        });
}

/* ============ AutoMind Assistant — rule-based chat widget ============
   Client-side keyword matching only. No API key, no external service,
   no data leaves the browser. Upgrading to a live LLM later requires
   either a hosted third-party widget (their own account) or a real
   backend proxy — plain GitHub Pages can't safely hold an API key. */
const AUTOMIND_KB = [
    { k: ['hello', 'hi', 'hey'], a: "Hey! Ask me about our projects, services, pricing, timelines, industries we work with, or how to reach the team." },
    { k: ['who are you', 'about automind', 'what is automind', 'about you', 'company'], a: "AutoMind Solutions is a full-stack technology partner — we build websites, custom software, mobile apps, AI automation bots, and network/VoIP infrastructure for businesses worldwide, from small local shops to universities and hospitals." },
    { k: ['service', 'services', 'offer', 'what do you do', 'what can you build'], a: "We build business websites, custom software, mobile apps, AI automation bots, and office network/VoIP infrastructure. See the full breakdown on the Services page." },
    { k: ['price', 'pricing', 'cost', 'how much', 'quote'], a: "We work in three tiers — Starter (website + one bot), Growth (custom software/mobile app), and Enterprise (full-stack builds). Exact pricing depends on scope — get a free quote via the Contact page." },
    { k: ['website', 'web site', 'landing page'], a: "Yes — business websites are part of our Starter tier, often paired with a single automation bot for immediate ROI." },
    { k: ['bot', 'automation', 'chatbot', 'ai bot', 'whatsapp bot'], a: "We build lead-response bots, WhatsApp auto-reply bots, booking flows, and custom automation for repetitive tasks — usually live within days. Check the Services page for a live example of a WhatsApp booking bot." },
    { k: ['mobile', 'android', 'ios', 'app'], a: "Mobile app development (Android & iOS) is part of our Growth tier, alongside custom desktop software." },
    { k: ['software', 'desktop', 'c#', '.net'], a: "We build custom desktop software in C# / .NET Core, built around your team's existing workflow." },
    { k: ['network', 'voip', 'infrastructure', 'phone system'], a: "We design secure office networks and VoIP phone systems (SIP/WebRTC/PBX) — see the Infrastructure page for details." },
    { k: ['academy', 'course', 'learn', 'training', 'bootcamp'], a: "AutoMind Academy runs short, intensive courses in Python & AI Basics and C# Desktop Mastery. Check the Academy page for details." },
    { k: ['project', 'projects', 'portfolio', 'mirrorflow', 'work', 'example'], a: "Our featured build is MirrorFlow, a live Binance Futures copy-trading SaaS product — see it on the Projects page, along with what's currently in development." },
    { k: ['time', 'timeline', 'how long', 'how fast'], a: "Starter-tier projects typically begin within days of a signed scope. We'll give you a realistic timeline on the free consultation call." },
    { k: ['worldwide', 'international', 'remote', 'country', 'timezone'], a: "We work with clients worldwide, fully remote, across time zones. Email or WhatsApp is the fastest way to reach us regardless of where you're based." },
    { k: ['industr', 'real estate', 'hotel', 'hospitality', 'hospital', 'medical', 'clinic', 'bank', 'finance', 'university', 'college', 'school', 'academia', 'restaurant', 'retail', 'ecommerce', 'e-commerce'], a: "We build for real estate, hospitality & hotels, healthcare & medical clinics, banking & finance, universities & colleges, restaurants, retail, logistics, legal, and other regulated or high-volume industries — each scoped to that industry's specific workflow and compliance needs." },
    { k: ['contact', 'reach', 'talk', 'call', 'email', 'human', 'person'], a: "You can reach us by email, WhatsApp, or the contact form — all linked at the bottom of every page, or just head to the Contact page." },
    { k: ['whatsapp'], a: "Tap the green WhatsApp button in the corner of the screen to chat directly." },
    { k: ['free', 'audit', 'consultation'], a: "New clients get a free automation audit and consultation call — no cost, no obligation." },
    { k: ['security', 'confidential', 'nda', 'safe', 'data'], a: "Project details are kept confidential, and we're happy to sign an NDA before scoping calls for sensitive work." },
    { k: ['payment', 'pay', 'invoice'], a: "Payment terms are agreed per project during scoping — fixed pricing is set upfront before work begins." },
    { k: ['thanks', 'thank you'], a: "You're welcome! Anything else I can help with?" }
];
const AUTOMIND_FALLBACK = "I don't have a canned answer for that one — tap below to reach a human directly, or head to the Contact page.";

function chatRespond(userText) {
    const text = userText.toLowerCase();
    const hit = AUTOMIND_KB.find(entry => entry.k.some(kw => text.includes(kw)));
    return hit ? hit.a : AUTOMIND_FALLBACK;
}

function appendChatMessage(text, sender) {
    const log = document.getElementById('chat-log');
    if (!log) return;
    const row = document.createElement('div');
    row.className = sender === 'user' ? 'flex justify-end' : 'flex justify-start';
    const bubble = document.createElement('div');
    bubble.className = sender === 'user'
        ? 'max-w-[85%] bg-brand-accent text-white text-xs rounded-xl rounded-tr-sm px-3.5 py-2.5'
        : 'max-w-[85%] bg-brand-dark border border-gray-800 text-gray-200 text-xs rounded-xl rounded-tl-sm px-3.5 py-2.5';
    bubble.textContent = text;
    row.appendChild(bubble);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
}

function appendChatQuickReplies(options) {
    const log = document.getElementById('chat-log');
    if (!log) return;
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-wrap gap-2 justify-start';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt.label;
        btn.className = 'text-[11px] font-medium px-3 py-1.5 rounded-full border border-gray-700 text-gray-200 hover:border-brand-accent transition';
        btn.onclick = () => { wrap.remove(); opt.onClick(); };
        wrap.appendChild(btn);
    });
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
}

function chatAskIntent() {
    appendChatQuickReplies([
        { label: "I want to build/automate something", onClick: () => {
            appendChatMessage("I want to build/automate something", 'user');
            setTimeout(() => {
                appendChatMessage("Great — the fastest path is a free consultation call. Head to the Contact page and tell us what you're working with; we'll scope it and reply within 24 hours.", 'bot');
                setTimeout(() => appendChatQuickReplies([
                    { label: "Go to Contact Page →", onClick: () => { window.location.href = 'contact.html'; } },
                    { label: "Ask something else first", onClick: () => appendChatMessage("Sure — go ahead and type your question below.", 'bot') }
                ]), 400);
            }, 350);
        } },
        { label: "Just exploring — tell me about AutoMind", onClick: () => {
            appendChatMessage("Just exploring — tell me about AutoMind", 'user');
            setTimeout(() => appendChatMessage("AutoMind Solutions builds websites, custom software, mobile apps, AI automation bots, and network/VoIP infrastructure for businesses worldwide — real estate, hospitality, healthcare, education, banking, and more. Ask me about services, pricing, projects, or timelines any time.", 'bot'), 350);
        } }
    ]);
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    const userText = input.value.trim();
    appendChatMessage(userText, 'user');
    input.value = '';
    setTimeout(() => appendChatMessage(chatRespond(userText), 'bot'), 350);
}

function chatKeydown(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function toggleChat() {
    const panel = document.getElementById('chat-panel');
    if (!panel) return;
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !panel.dataset.greeted) {
        panel.dataset.greeted = '1';
        setTimeout(() => appendChatMessage("Hi! I'm the AutoMind Assistant 👋 I can tell you about our projects, services, pricing, timelines, or the industries we work with.", 'bot'), 200);
        setTimeout(chatAskIntent, 700);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    loadConfig();
    mountTechLines();
    loadDownloads();
});
