"""
Parse Question Bank.md into questions.json.
Then merge in the 38 hook-augmented questions from the plan.
Outputs to site/data/questions.json.

Run from anywhere; paths are absolute.
"""

import json
import re
from pathlib import Path

ROOT = Path(r"C:\Users\Peter Ellis\OneDrive\Teaching\2026\12PHIL - 2026\Issues Study")
BANK = ROOT / "Question Bank.md"
OUT = ROOT / "site" / "data" / "questions.json"

# Map markdown domain headings (## ...) → site domain slugs
DOMAIN_MAP = {
    "ethics": "ethics",
    "metaphysics": "metaphysics",
    "epistemology": "epistemology",
    "political philosophy": "political",
    "philosophy of religion": "religion",
    "philosophy of mind & technology": "mind-tech",
    "philosophy of mind and technology": "mind-tech",
    "philosophy of mind": "mind-tech",
    "aesthetics": "aesthetics",
}

# Recognise a list item starting with "- "
# Forms seen in the bank:
#   - "QUESTION TEXT" — *italic source*
#   - 'SOMETHING' (statement-prompt with no quotes — rare)
#   - "QUESTION" — *... suggested: Foo, Bar*
ITEM_RE = re.compile(r'^\s*-\s+(.+?)\s*$')
QUOTED_RE = re.compile(r'^[“"]([^“”"]+)[”"](?:\s*[—\-]\s*\*(.*?)\*)?')
SOURCE_RE = re.compile(r'^\*?(.*?)\*?$')
SUGGESTED_RE = re.compile(r'suggested\s*(?:philosopher[s]?)?\s*:?\s*([^*]+?)(?:\.|\*|$)', re.IGNORECASE)


def parse_bank(text: str):
    questions = []
    domain = None
    subdomain = None
    qid = 1

    for raw in text.splitlines():
        line = raw.rstrip()

        if line.startswith("## ") and not line.startswith("### "):
            heading = line[3:].strip().lower()
            # Skip non-domain h2 headings
            if heading in DOMAIN_MAP:
                domain = DOMAIN_MAP[heading]
                subdomain = None
            elif heading.startswith("quick reference") or heading.startswith("sace"):
                domain = None
                subdomain = None
            else:
                # Try fuzzy match
                for k, v in DOMAIN_MAP.items():
                    if k in heading:
                        domain = v
                        subdomain = None
                        break
                else:
                    domain = None

        elif line.startswith("### "):
            subdomain = line[4:].strip()

        elif line.startswith("- ") and domain:
            m = QUOTED_RE.match(line[2:].strip())
            if not m:
                # Some items don't have surrounding quotes (statement-prompts).
                # Take everything before " — *" as the question.
                rest = line[2:].strip()
                if " — *" in rest:
                    qtext, src = rest.split(" — *", 1)
                    src = src.rstrip("*").strip()
                else:
                    qtext, src = rest, ""
                qtext = qtext.strip(' "“”‘’')
            else:
                qtext = m.group(1).strip()
                src = (m.group(2) or "").strip()

            # Extract suggested philosophers
            suggested = []
            sm = SUGGESTED_RE.search(src)
            if sm:
                raw_list = sm.group(1).strip().rstrip(".,;")
                # Split on common separators
                parts = re.split(r'\s*[,/&]\s+|\s+and\s+', raw_list)
                suggested = [p.strip() for p in parts if p.strip()]

            entry = {
                "id": f"q{qid:03d}",
                "text": qtext,
                "domain": domain,
                "subdomain": subdomain or "",
                "source": src,
                "suggested_thinkers": suggested,
                "origin": "bank",
            }
            questions.append(entry)
            qid += 1

    return questions


# === The 38 hook questions from the plan, ready to merge ===
HOOK_QUESTIONS = [
    # Ethics (7)
    {"text": "A surgeon could save five patients by harvesting organs from one healthy visitor. Should she? Does the act of saving more lives always justify what is done to get there?",
     "domain": "ethics", "subdomain": "Applied & normative ethics",
     "thinkers": ["Foot", "Kant", "Mill"]},
    {"text": "You can donate $5,000 to save a child dying overseas right now, or spend it on a family holiday. Singer argues there is no morally relevant difference between this and letting a child drown in front of you. Is he right?",
     "domain": "ethics", "subdomain": "Applied & normative ethics",
     "thinkers": ["Singer", "Kant", "Aristotle"]},
    {"text": "A drug company can run a trial that will save thousands but requires deceiving participants about the risks. Is deception ever morally permissible when the stakes are high enough?",
     "domain": "ethics", "subdomain": "Applied & normative ethics",
     "thinkers": ["Kant", "Mill", "Anscombe"]},
    {"text": "Enhancement drugs let soldiers feel no remorse after killing. If the drugs work, does moral responsibility for battlefield deaths shift to the commanders who prescribed them?",
     "domain": "ethics", "subdomain": "Applied & normative ethics",
     "thinkers": ["Aristotle", "Kant", "Foot"]},
    {"text": "You discover a beloved teacher plagiarised their entire PhD, but spent 30 years doing genuine good. Does past dishonesty permanently negate a life of virtue?",
     "domain": "ethics", "subdomain": "Meta-ethics & moral theory",
     "thinkers": ["Aristotle", "Hume", "Murdoch"]},
    {"text": "Gilligan argues that an ethic of care is as rationally defensible as an ethic of rights. Is caring for those close to us a moral strength or a form of systematic bias?",
     "domain": "ethics", "subdomain": "Meta-ethics & moral theory",
     "thinkers": ["Gilligan", "Kant", "Nussbaum"]},
    {"text": "A self-driving car must choose: swerve to kill its passenger and save five pedestrians, or stay straight and kill the five. Who should program the decision — and is programming a moral choice?",
     "domain": "ethics", "subdomain": "Applied & normative ethics",
     "thinkers": ["Mill", "Kant", "Foot"]},

    # Metaphysics (5)
    {"text": "Imagine you are teleported: your body is scanned, destroyed, and perfectly reconstructed on Mars. The person who steps off is convinced they are you. Are they?",
     "domain": "metaphysics", "subdomain": "Personal identity & the self",
     "thinkers": ["Parfit", "Locke", "Hume"]},
    {"text": "Every neuron in your brain is gradually replaced, one by one, with a silicon chip that performs the same function. At what point, if any, do you stop being you?",
     "domain": "metaphysics", "subdomain": "Personal identity & the self",
     "thinkers": ["Parfit", "Locke", "Williams"]},
    {"text": "Lightning strikes a swamp, and by pure chance the molecules rearrange into a perfect physical duplicate of you — Swampman — with all your memories. Does Swampman have your identity?",
     "domain": "metaphysics", "subdomain": "Personal identity & the self",
     "thinkers": ["Hume", "Locke", "Parfit"]},
    {"text": "If a perfect copy of your brain were uploaded to a computer and you died immediately after, would the digital mind be you, or just a very convincing impersonator?",
     "domain": "metaphysics", "subdomain": "Personal identity & the self",
     "thinkers": ["Parfit", "Descartes", "Hume"]},
    {"text": "A heap of sand has one grain removed. It is still a heap. Keep going — at exactly what point does a heap become a non-heap, and what does this tell us about the nature of reality?",
     "domain": "metaphysics", "subdomain": "Reality & substance",
     "thinkers": ["Russell", "Plato", "Aristotle"]},

    # Epistemology (6)
    {"text": "Mary is a brilliant neuroscientist who knows every physical fact about colour vision but has lived her whole life in a black-and-white room. When she sees red for the first time, does she learn something new?",
     "domain": "epistemology", "subdomain": "Knowledge, mind, and qualia",
     "thinkers": ["Jackson", "Descartes", "Russell"]},
    {"text": "Edmund Gettier showed that you can have a justified true belief that still is not knowledge. If knowledge is not justified true belief, can we define it at all?",
     "domain": "epistemology", "subdomain": "What knowledge is",
     "thinkers": ["Hume", "Descartes", "Russell"]},
    {"text": "Your most trusted friend tells you they witnessed a crime. You have no independent evidence. Is their testimony enough for you to know what happened, or merely enough to believe it?",
     "domain": "epistemology", "subdomain": "Sources of knowledge",
     "thinkers": ["Hume", "Locke", "Russell"]},
    {"text": "If everything you believe about the external world could be produced by a perfectly deceptive AI feeding signals directly to your brain, is there any belief you can be certain of?",
     "domain": "epistemology", "subdomain": "Scepticism",
     "thinkers": ["Descartes", "Russell", "Hume"]},
    {"text": "You witness a car accident and later see a photo labelled 'the wreck.' Your memory of the crash changes to match the photo. Can you trust any memory as genuine knowledge?",
     "domain": "epistemology", "subdomain": "Sources of knowledge",
     "thinkers": ["Hume", "Locke", "Descartes"]},
    {"text": "If all scientific knowledge is produced within cultural paradigms that shape what counts as evidence, is science discovering truth or constructing it?",
     "domain": "epistemology", "subdomain": "Scientific knowledge",
     "thinkers": ["Hume", "Russell", "Descartes"]},

    # Political Philosophy (5)
    {"text": "You must design the rules of your society without knowing whether you will be born rich or poor, able-bodied or disabled, majority or minority. What principles of justice would you choose — and why?",
     "domain": "political", "subdomain": "Justice & the state",
     "thinkers": ["Kant", "Hobbes", "Locke"]},
    {"text": "Robert Nozick argues that taxing your wages to fund welfare is morally equivalent to forcing you to work for others. Is redistribution a matter of justice or a form of compulsion?",
     "domain": "political", "subdomain": "Justice & the state",
     "thinkers": ["Locke", "Hobbes", "Mill"]},
    {"text": "A government installs cameras on every street corner and crime drops by 40%. If no innocent person is ever punished, has any wrong been done?",
     "domain": "political", "subdomain": "Liberty & the state",
     "thinkers": ["Mill", "Kant", "Hobbes"]},
    {"text": "Should citizens who refuse to vote be fined? Discuss in relation to various philosophical positions on the duties of citizenship.",
     "domain": "political", "subdomain": "Liberty & the state",
     "thinkers": ["Hobbes", "Locke", "Mill"]},
    {"text": "Confucius held that social harmony requires people to accept their role in a hierarchy. Mill held that society flourishes when individuals are free to challenge convention. Whose vision is more defensible for a modern democracy?",
     "domain": "political", "subdomain": "Liberty & the state",
     "thinkers": ["Confucius", "Mill", "Hobbes"]},

    # Religion (5)
    {"text": "If God is perfectly loving, why does he hide from reasonable people who are genuinely searching for him? Does the existence of sincere, searching non-believers disprove the existence of a loving God?",
     "domain": "religion", "subdomain": "Existence of God",
     "thinkers": ["Kierkegaard", "Hume", "Russell"]},
    {"text": "Pascal argued that since you cannot know whether God exists, rational self-interest demands you bet on belief. Is deciding to believe on the grounds of personal advantage a genuine religious act — or a category error?",
     "domain": "religion", "subdomain": "Faith & reason",
     "thinkers": ["Kierkegaard", "Hume", "Russell"]},
    {"text": "If an all-powerful God could have created a world without suffering and chose not to, is God morally responsible for every act of child abuse, every earthquake, every cancer? Discuss.",
     "domain": "religion", "subdomain": "Problem of evil",
     "thinkers": ["Hume", "Russell", "Kierkegaard"]},
    {"text": "Nietzsche declared that God is dead and we have killed him. Did modernity destroy not just religious belief but the moral framework that depended on it — and can we build a new one?",
     "domain": "religion", "subdomain": "After belief",
     "thinkers": ["Nietzsche", "Kierkegaard", "Sartre"]},
    {"text": "Can a person hold both that the universe is 13.8 billion years old and that it was created by a personal God — or are scientific and religious knowledge claims fundamentally incompatible?",
     "domain": "religion", "subdomain": "Faith & reason",
     "thinkers": ["Hume", "Russell", "Kierkegaard"]},

    # Mind & Tech (5)
    {"text": "A robot passes every behavioural test for consciousness — it reports pain, forms plans, expresses preferences. Is there any reason to deny that it suffers?",
     "domain": "mind-tech", "subdomain": "AI consciousness",
     "thinkers": ["Descartes", "Jackson", "Hume"]},
    {"text": "John Searle placed a person in a room who manipulates Chinese symbols by rule without understanding Chinese. The room outputs perfect Chinese. Does the room understand Chinese — and does this settle whether AI can think?",
     "domain": "mind-tech", "subdomain": "AI consciousness",
     "thinkers": ["Descartes", "Jackson", "Russell"]},
    {"text": "An algorithm trained on biased historical data systematically recommends harsher sentences for defendants from minority backgrounds. Is the algorithm racist? Can an object be morally responsible?",
     "domain": "mind-tech", "subdomain": "Ethics of AI",
     "thinkers": ["Kant", "Aristotle", "Mill"]},
    {"text": "If a brain emulation of a recently deceased person could be run on a server, responding to messages as they would have, does the digital entity have rights?",
     "domain": "mind-tech", "subdomain": "Ethics of AI",
     "thinkers": ["Descartes", "Parfit", "Jackson"]},
    {"text": "Nozick's Experience Machine can give you a life of perfect simulated happiness. You will never know it is simulated. Should you plug in — and what does your answer reveal about what makes life genuinely valuable?",
     "domain": "mind-tech", "subdomain": "What makes life valuable",
     "thinkers": ["Parfit", "Mill", "Nietzsche"]},

    # Aesthetics (5)
    {"text": "Kant argued that when we call something beautiful we make a claim with universal authority — yet people disagree constantly about beauty. Is aesthetic judgment objective, subjective, or something in between?",
     "domain": "aesthetics", "subdomain": "Aesthetic judgement",
     "thinkers": ["Hume", "Plato", "Kant"]},
    {"text": "A painting created by an AI trained on ten million artworks wins a major prize. Has it created art — or very sophisticated pattern-matching? Does the absence of intention, suffering, or a human story disqualify it?",
     "domain": "aesthetics", "subdomain": "What art is",
     "thinkers": ["Hume", "Nietzsche", "Sartre"]},
    {"text": "Banksy's shredded painting — destroyed the moment it sold — doubled in value. If an artwork's meaning is completed by its own destruction, can destruction be an aesthetic act?",
     "domain": "aesthetics", "subdomain": "What art is",
     "thinkers": ["Hume", "Nietzsche", "Plato"]},
    {"text": "We instinctively call a mountain range sublime and a shopping centre ugly. Is our aesthetic response to nature a form of knowledge about the world, or merely a projection of human preferences?",
     "domain": "aesthetics", "subdomain": "Sublime & beauty",
     "thinkers": ["Hume", "Kant", "Aristotle"]},
    {"text": "If you listen to a piece of music and feel profound sadness, but the composer intended it to express joy, have you understood the work or misunderstood it? Who owns the meaning of art?",
     "domain": "aesthetics", "subdomain": "Meaning & interpretation",
     "thinkers": ["Hume", "Sartre", "Nietzsche"]},
]


def main():
    text = BANK.read_text(encoding="utf-8")
    bank_questions = parse_bank(text)
    print(f"Parsed {len(bank_questions)} questions from Question Bank.md")

    # Append hook questions with continuing IDs
    next_id = len(bank_questions) + 1
    hooks_formatted = []
    for i, h in enumerate(HOOK_QUESTIONS):
        hooks_formatted.append({
            "id": f"q{next_id + i:03d}",
            "text": h["text"],
            "domain": h["domain"],
            "subdomain": h["subdomain"],
            "source": "Hook-augmented (2026 Issues Study site)",
            "suggested_thinkers": h["thinkers"],
            "origin": "hook-augmented",
        })

    all_questions = bank_questions + hooks_formatted
    print(f"Total: {len(all_questions)} ({len(bank_questions)} bank + {len(hooks_formatted)} hook)")

    # Sort by domain then by ID for stable ordering
    domain_order = ["ethics", "metaphysics", "epistemology", "political",
                    "religion", "mind-tech", "aesthetics"]

    def sort_key(q):
        try:
            d_idx = domain_order.index(q["domain"])
        except ValueError:
            d_idx = 99
        return (d_idx, q["id"])

    all_questions.sort(key=sort_key)

    # Per-domain counts (for diagnostics)
    counts = {}
    for q in all_questions:
        counts[q["domain"]] = counts.get(q["domain"], 0) + 1
    print("\nPer-domain counts:")
    for d in domain_order:
        print(f"  {d:14s} {counts.get(d, 0):3d}")
    print(f"  uncategorised   {sum(1 for q in all_questions if q['domain'] not in domain_order):3d}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(all_questions, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWritten to: {OUT}")


if __name__ == "__main__":
    main()
