# Madiha in Tech — Portfolio Site

Professional portfolio for Madiha Khan, Senior Product Support Specialist at Stack Overflow. Built to give recruiters and hiring managers a clear picture of her technical depth, career journey, and approach to support engineering.

**Live site:** [madihaintech.me](https://madihaintech.me)

---

## About This Portfolio

This site reflects 5+ years of enterprise SaaS support experience, with a focus on technical depth, system building, and genuine curiosity about AI. It is built and maintained entirely by Madiha — no templates, no page builders.

**What it covers:**

- Career journey from customer service to sole EMEA support engineer at Stack Overflow
- Technical skills across APIs, authentication systems, observability, and incident response
- Key achievements including 98% CSAT, 25% faster P1/P2 resolution, and 20% reduction in repeat tickets
- A featured AI project documenting the full process of building a production chatbot from scratch
- A Claude-powered portfolio assistant that answers recruiter questions in real time

---

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — intro, stats, what I bring, featured project, toolbox |
| `about.html` | Personal story, career timeline, Ramadan fundraising |
| `skills.html` | Core strengths, career history carousel, tools by impact area, certifications |
| `projects.html` | Full four-phase journey of building the AI chatbot |
| `contact.html` | LinkedIn and GitHub links |

---

## Featured Project: Claude-Powered Portfolio Assistant

The chatbot embedded across this site is a live production AI assistant built from scratch.

**The journey:**

1. Started with IBM Watson and Google Dialogflow CX — hit persistent permission errors and domain allowlisting issues across Google Cloud IAM
2. Switched to the Anthropic API (Claude) — immediate improvement, no intent mapping, no training data required
3. Exposed the API key in front-end JavaScript — caught by GitHub secret scanning on push
4. Built a Cloudflare Worker proxy to keep the key server-side — configured CORS to only accept requests from `madihaintech.me`, stored the key as an encrypted secret

The chatbot now runs live across all pages, opens automatically after two seconds, maintains session conversation history, and is grounded in a detailed system prompt about Madiha's background.

**Full write-up:** [madihaintech.me/projects.html](https://madihaintech.me/projects.html)

---

## Technical Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **AI:** Claude (Anthropic API) via `claude-sonnet-4-20250514`
- **Security:** Cloudflare Workers proxy with encrypted secrets and CORS origin restriction
- **Hosting:** GitHub Pages
- **Version control:** Git and GitHub

---

## Target Roles

This portfolio is built for technical support and AI support roles at developer platform and infrastructure companies.

**Roles:** AI Support Engineer, Senior Technical Support Engineer, Support Operations Specialist, Product Support Specialist (Technical)

**Companies:** Anthropic, Cloudflare, and similar developer-focused organisations

---

## Contact

- **LinkedIn:** [linkedin.com/in/madihakhan-](https://www.linkedin.com/in/madihakhan-)
- **Portfolio:** [madihaintech.me](https://madihaintech.me)
- **GitHub:** [github.com/KhanKMadiha](https://github.com/KhanKMadiha)

---

*Built with care by Madiha Khan 🌸*

