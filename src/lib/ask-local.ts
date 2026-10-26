import type { Locale } from "@/i18n/config";
import { getProfile, person } from "@/content/profile";

// Free, key-less answers for "Ask Nikhil": a small intent matcher over the site's own content.
// Used when no AI provider key is configured. It never invents anything; unknown questions get
// a pointer to email.

type Intent = { keys: RegExp; answer: (locale: Locale) => string };

const join = (items: string[], locale: Locale) => {
  if (items.length < 2) return items.join("");
  const and = locale === "hi" ? " और " : " and ";
  return `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
};

const intents: Intent[] = [
  {
    keys: /(head of it|it head|current|abhi|role|job|position|kya karte|work now|simdaas|हेड|वर्तमान|अभी)/i,
    answer: (l) => {
      const p = getProfile(l);
      const r = p.roles[0];
      // The journey line starts with the title ("Head of …: …"); keep only what follows.
      const raw = p.journey.scenes[p.journey.scenes.length - 1].line.replace(/^[^:]+:\s*/, "");
      const line = raw.charAt(0).toUpperCase() + raw.slice(1);
      return l === "hi"
        ? `निखिल अभी ${r.company} (${r.place}) में ${r.title} हैं (${r.period})। ${line}`
        : `Nikhil is ${r.title} at ${r.company} (${r.place}), ${r.period}. ${line}`;
    },
  },
  {
    keys: /(experience|career|companies|worked|history|journey|अनुभव|कंपनी|airtel|cyber3ra|skyai)/i,
    answer: (l) => {
      const p = getProfile(l);
      const list = p.roles.map((r) => `${r.title}, ${r.company} (${r.period})`);
      return l === "hi"
        ? `निखिल का अनुभव:\n• ${list.join("\n• ")}`
        : `Nikhil's career, newest first:\n• ${list.join("\n• ")}`;
    },
  },
  {
    keys: /(cloud|aws|azure|digitalocean|क्लाउड)/i,
    answer: (l) => {
      const clouds =
        getProfile(l).stack.groups.find((g) => /cloud|क्लाउड/i.test(g.name))?.items ?? [];
      return l === "hi"
        ? `उन्होंने ${join(clouds, l)} पर production सिस्टम चलाए हैं, Docker, Kubernetes और Terraform के साथ। SimDaaS में वे क्लाउड अकाउंट, बिलिंग और कॉस्ट गार्डरेल भी संभालते हैं।`
        : `He has run production systems on ${join(clouds, l)}, with Docker, Kubernetes and Terraform. At SimDaaS he also owns the cloud accounts, billing and cost guardrails.`;
    },
  },
  {
    keys: /(devops|ci\/?cd|kubernetes|k8s|docker|terraform|jenkins|pipeline|monitor|grafana|sentry)/i,
    answer: (l) => {
      const g = getProfile(l).stack.groups;
      const pick = (re: RegExp) => g.find((x) => re.test(x.name))?.items ?? [];
      const platform = pick(/platform|प्लेटफ़ॉर्म/i);
      const obs = pick(/observ|ऑब्ज़/i);
      return l === "hi"
        ? `DevOps टूल: ${join(platform, l)}। मॉनिटरिंग के लिए ${join(obs, l)}। उन्होंने कई प्रोडक्ट्स के लिए Jenkins और SonarQube से CI/CD पाइपलाइन बनाई हैं।`
        : `DevOps tools: ${join(platform, l)}. For monitoring: ${join(obs, l)}. He has built CI/CD pipelines with Jenkins and SonarQube for several products.`;
    },
  },
  {
    keys: /(security|cyber|bug bounty|ctf|securiumx|seatbelt|सिक्योरिटी|साइबर)/i,
    answer: (l) =>
      l === "hi"
        ? "Cyber3ra में उन्होंने SecuriumX बनाया, एक बग-बाउंटी और CTF प्लेटफ़ॉर्म। SimDaaS में वे कंपनी की IT सिक्योरिटी पॉलिसी और इंसिडेंट रिस्पॉन्स संभालते हैं। ओपन सोर्स में 'seatbelt' AI एजेंट्स के ख़तरनाक shell कमांड रोकता है।"
        : "At Cyber3ra he built SecuriumX, a bug-bounty and CTF platform. At SimDaaS he owns the company's IT security policy and incident response. In open source, 'seatbelt' stops AI coding agents from running dangerous shell commands.",
  },
  {
    keys: /(skill|stack|tech|tools|language|framework|python|django|react|vue|database|स्किल|टेक|टूल)/i,
    answer: (l) => {
      const g = getProfile(l).stack.groups.slice(0, 5);
      return (
        (l === "hi" ? "मुख्य स्किल्स:\n" : "Main skills:\n") +
        g.map((x) => `• ${x.name}: ${x.items.join(", ")}`).join("\n")
      );
    },
  },
  {
    keys: /(project|open source|github|built|product|banaya|प्रोजेक्ट|बनाया|प्रोडक्ट)/i,
    answer: (l) => {
      const p = getProfile(l);
      const prods = p.roles.flatMap((r) => r.products ?? []).map((x) => x.name);
      const oss = p.projects.slice(0, 3).map((x) => x.name);
      return l === "hi"
        ? `प्रोडक्ट: ${join(prods, l)}। ओपन सोर्स: ${join(oss, l)}। सब साइट के "काम" सेक्शन में हैं।`
        : `Products: ${join(prods, l)}. Open source: ${join(oss, l)}. All of them are in the Work section.`;
    },
  },
  {
    keys: /(education|degree|college|university|study|पढ़ाई|डिग्री|शिक्षा)/i,
    answer: (l) => {
      const e = getProfile(l).experience.education;
      return `${e.degree}, ${e.school} (${e.year}).`;
    },
  },
  {
    keys: /(contact|email|hire|reach|available|job offer|collab|freelance|संपर्क|ईमेल|हायर)/i,
    answer: (l) =>
      l === "hi"
        ? `सबसे अच्छा तरीका ईमेल है: ${person.email}। LinkedIn: ${person.links.linkedin}`
        : `Email is best: ${person.email}. LinkedIn: ${person.links.linkedin}`,
  },
  {
    keys: /(where|location|city|based|india|kanpur|कहाँ रहते|लोकेशन)/i,
    answer: (l) =>
      l === "hi"
        ? "निखिल भारत में हैं; SimDaaS Autonomy, IIT कानपुर में काम करते हैं।"
        : "Nikhil is based in India and works at SimDaaS Autonomy, IIT Kanpur.",
  },
  {
    keys: /(photo|camera|hobby|शौक|फ़ोटो)/i,
    answer: (l) =>
      l === "hi"
        ? "काम के बाहर वे अक्सर कैमरे के पीछे होते हैं: फ़ोटोग्राफ़ी उनका शौक है।"
        : "Away from work he's usually behind a camera: photography is his hobby.",
  },
];

/** Picks the best matching answer, or a polite "ask by email". */
export function localAnswer(question: string, locale: Locale): string {
  const hits = intents.filter((i) => i.keys.test(question));
  if (hits.length === 0) {
    return locale === "hi"
      ? `इसका जवाब मेरे पास नहीं है। मैं निखिल के काम, अनुभव, स्किल्स, प्रोजेक्ट्स और संपर्क के बारे में बता सकता हूँ। बाक़ी के लिए ईमेल करें: ${person.email}`
      : `I don't have that one. I can tell you about Nikhil's role, experience, skills, cloud and security work, projects or how to reach him. For anything else, email ${person.email}.`;
  }
  return hits
    .slice(0, 2)
    .map((i) => i.answer(locale))
    .join("\n\n");
}
