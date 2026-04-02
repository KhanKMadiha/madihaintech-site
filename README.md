# Madiha in Tech — Portfolio Site

My personal portfolio site, built and maintained entirely by me. No templates, no page builders — just HTML, CSS, and JavaScript.

**Live site:** [madihaintech.me](https://madihaintech.me)

---

## About This Site

I built this portfolio to give a honest picture of how I work, what I've built, and what I care about. It covers my career journey from customer service roles through to my current position as the sole EMEA support engineer at Stack Overflow, where I own every ticket and every P1/P2 incident across 100+ enterprise accounts.

It also documents something I'm genuinely proud of which is building a production AI chatbot from scratch, hitting real problems along the way, and solving them properly.

---

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Homepage — who I am, impact stats, what I bring, featured project, toolbox |
| `about.html` | My story, career timeline, and a bit about who I am outside of work |
| `skills.html` | Core strengths, career history, tools by impact area, certifications |
| `projects.html` | The full four-phase story of building the AI chatbot |
| `contact.html` | How to reach me |

---

## Featured Project: Claude-Powered Portfolio Assistant

The chatbot in the bottom right corner of every page is a live production AI assistant I built from scratch. Here's what actually happened:

1. **Started with IBM Watson and Google Dialogflow CX** — completed IBM AI Fundamentals certification, built a working prototype, then hit persistent Permission Denied errors caused by domain allowlisting and Messenger integration settings inside the Google Cloud console. Spent time debugging across IAM, Dialogflow settings, and the front-end embed before deciding to move on.

2. **Switched to the Anthropic API** — replaced intent mapping with a language model and a detailed system prompt. No training data, no permission configuration. Built a custom chat widget in HTML and JavaScript to match the site's design.

3. **Exposed the API key in front-end JavaScript** — GitHub's secret scanning caught it immediately on push. Valuable lesson learned.

4. **Built a Cloudflare Worker proxy** — the Worker sits between the site and the Anthropic API, adds the key server-side, and only accepts requests from `madihaintech.me` via CORS. The key is stored as an encrypted secret in Cloudflare and never appears in the code or browser.

The chatbot now runs live across all pages, opens automatically after two seconds, and maintains full session conversation history.

**Full write-up:** [madihaintech.me/projects.html](https://madihaintech.me/projects.html)

---

## Technical Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **AI:** Claude via the Anthropic API (`claude-sonnet-4-20250514`)
- **Security:** Cloudflare Workers proxy with encrypted secrets and CORS origin restriction
- **Hosting:** GitHub Pages
- **Version control:** Git and GitHub

---

## Contact

- **LinkedIn:** [linkedin.com/in/madihakhan-](https://www.linkedin.com/in/madihakhan-)
- **Portfolio:** [madihaintech.me](https://madihaintech.me)

---

*Built with care 🌸*

