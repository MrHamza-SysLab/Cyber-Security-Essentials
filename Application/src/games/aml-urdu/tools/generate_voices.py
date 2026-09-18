"""Generate neural MP3 voiceovers for every auto-typed SENTINEL line.

English: Elena GB / Marcus GB / Danish Indian-English (closest Pakistani English).
Urdu:    ur-PK Uzma (Elena) and ur-PK Asad (Marcus + Danish, pitched apart).

Usage:
  python tools/generate_voices.py          # Urdu only (default)
  python tools/generate_voices.py en
  python tools/generate_voices.py ur
  python tools/generate_voices.py all
"""
import asyncio
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT_EN = ROOT / "assets" / "voice"
OUT_UR = ROOT / "assets" / "voice" / "ur"

VOICES_EN = {
    "elena":  ("en-GB-SoniaNeural", "-5%", "+0Hz"),
    "marcus": ("en-GB-RyanNeural", "-5%", "+0Hz"),
    "danish": ("en-IN-PrabhatNeural", "-5%", "+0Hz"),
}

# Pakistani Urdu neural voices. Asad is the only ur-PK male, so Marcus and
# Danish share him but sit at different rate/pitch so they don't sound identical.
VOICES_UR = {
    "elena":  ("ur-PK-UzmaNeural", "-6%", "-2Hz"),   # calm senior woman
    "marcus": ("ur-PK-AsadNeural", "-10%", "-12Hz"), # lower, slower analyst
    "danish": ("ur-PK-AsadNeural", "+8%", "+14Hz"),  # brighter, impatient customer
}

LINES_EN = [
    ("01-intro-elena.mp3", "elena",
     "You are the last control before the money moves. Everything upstream of you is paperwork. Everything downstream is somebody else's problem."),
    ("02-intro-marcus.mp3", "marcus",
     "Four modules. Onboard a customer who does not want to be onboarded properly, learn the red-flag families by sight, work a live transaction queue, and drill the thresholds until they are reflex."),
    ("03-onboard-brief-elena-1.mp3", "elena",
     "There is a new customer waiting at the counter. Your job is customer due diligence: identify them, verify the identity against a reliable source, establish who really owns the business, and then decide how much scrutiny this file needs."),
    ("04-onboard-brief-elena-2.mp3", "elena",
     "The customer will be helpful right up to the moment you ask something inconvenient. Remember that rapport is not what the file is judged on."),
    ("05-onboard-danish-identify.mp3", "danish",
     "Good morning. I want to open a current account for my company — Raza Trading Private Limited. I have the incorporation certificate here, and my own CNIC."),
    ("06-onboard-danish-verify.mp3", "danish",
     "Here is the CNIC. Look — the photo is clearly me. That's enough, isn't it? I'm in a bit of a rush, I have a flight this evening."),
    ("07-onboard-danish-ownership-1.mp3", "danish",
     "The company shares? I hold 15%. My brother-in-law holds most of it — around 60% — but he's a silent partner, he won't be involved in the account at all. He asked me to handle all of it."),
    ("08-onboard-danish-ownership-2.mp3", "danish",
     "Fine, fine. His name is Adnan Sheikh. He is... he serves as an advisor and his father is the provincial minister for industries. Is that a problem? Everything is completely legitimate."),
    ("09-onboard-danish-risk.mp3", "danish",
     "So can we finish this today? I have already told my supplier the account would be ready. Expected turnover — let's say around 5 million a month to be safe."),
    ("10-onboard-danish-edd.mp3", "danish",
     "Enhanced due diligence? What does that involve? I have given you everything already."),
    ("11-onboard-danish-tipping.mp3", "danish",
     "Look — between us, is my account going to get reported to someone? I have heard banks report people. If anything gets filed on me I want to know about it first."),
    ("12-onboard-danish-monitor.mp3", "danish",
     "All right. Send it to your manager then. How will you handle the account once it opens?"),
    ("13-onboard-danish-restricted.mp3", "danish",
     "Why is my account restricted? I deposited 4.8 million this week and now nothing is going through. You told me everything was fine."),
    ("14-onboard-danish-whatnext.mp3", "danish",
     "So what happens now? Am I going to lose the account?"),
    ("15-radar-brief-marcus-1.mp3", "marcus",
     "Five red-flag families, A through E, straight out of Annexure-II. If you cannot name the family an observation belongs to, you cannot reach for the right follow-up question."),
    ("16-radar-brief-marcus-2.mp3", "marcus",
     "Ten observations, eighteen seconds each. Answer fast and the combo multiplier stays alive."),
    ("17-console-brief-elena-1.mp3", "elena",
     "This is the live queue. Every case in it is a real transaction waiting on a disposition from you: clear it, flag it, or escalate it."),
    ("18-console-brief-elena-2.mp3", "elena",
     "Flagging is not enough on its own. You have to name the indicator you are acting on, because an STR has to record the basis for the decision — and so does a decision not to file one."),
    ("19-thresholds-brief-elena-1.mp3", "elena",
     "Thresholds are the part you cannot look up mid-conversation. Two million rupees in cash triggers a CTR whether or not anything looks wrong. Five hundred thousand from a walk-in triggers identity verification. An STR has no floor at all."),
    ("20-thresholds-brief-elena-2.mp3", "elena",
     "Twelve drills, twenty-two seconds each. Where more than one obligation could apply, the higher duty wins."),
]

# Spoken Pakistani Urdu — bank-floor mix: Urdu grammar, English AML terms as bankers actually say them.
LINES_UR = [
    ("01-intro-elena.mp3", "elena",
     "آپ پیسے منتقل ہونے سے پہلے آخری کنٹرول ہیں۔ اوپر جو کچھ ہے وہ کاغذی کارروائی ہے۔ نیچے جو ہے وہ کسی اور کا مسئلہ ہے۔"),
    ("02-intro-marcus.mp3", "marcus",
     "چار ماڈیولز ہیں۔ ایک ایسا کسٹمر آن بورڈ کرو جو ٹھیک طریقے سے آن بورڈ نہیں ہونا چاہتا، ریڈ فلیگ فیملیز نظر سے پہچانو، لائیو ٹرانزیکشن کیو سنبھالو، اور تھریشولڈز اتنے رٹا لو کہ ریفلیکس بن جائیں۔"),
    ("03-onboard-brief-elena-1.mp3", "elena",
     "کاؤنٹر پر ایک نیا کسٹمر انتظار کر رہا ہے۔ آپ کا کام کسٹمر ڈیو ڈیلیجنس ہے: ان کی شناخت کریں، شناخت کا کسی قابلِ اعتماد ذریعے سے ویریفائی کریں، یہ طے کریں کہ کاروبار کا اصل مالک کون ہے، اور پھر فیصلہ کریں کہ اس فائل پر کتنی جانچ چاہیے۔"),
    ("04-onboard-brief-elena-2.mp3", "elena",
     "کسٹمر اس لمحے تک مددگار رہے گا جب تک آپ کچھ ناگوار نہ پوچھیں۔ یاد رکھیں — فائل پر فیصلہ رپورٹ سے ہوتا ہے، دوستانہ رویے سے نہیں۔"),
    ("05-onboard-danish-identify.mp3", "danish",
     "صبح بخیر۔ میں اپنی کمپنی، رضا ٹریڈنگ پرائیویٹ لمیٹڈ، کا کرنٹ اکاؤنٹ کھولنا چاہتا ہوں۔ میرے پاس انکارپوریشن سرٹیفکیٹ بھی ہے، اور اپنا سی این آئی سی بھی۔"),
    ("06-onboard-danish-verify.mp3", "danish",
     "یہ رہی سی این آئی سی۔ دیکھیں، فوٹو بالکل میری ہے۔ بس یہی کافی ہے نا؟ میں تھوڑی جلدی میں ہوں، شام کو فلائٹ ہے۔"),
    ("07-onboard-danish-ownership-1.mp3", "danish",
     "کمپنی کے شیئرز؟ میرے پاس پندرہ فیصد ہیں۔ زیادہ تر، تقریباً ساٹھ فیصد، میرے سالے کے پاس ہیں — مگر وہ سائلنٹ پارٹنر ہیں، اکاؤنٹ سے ان کا کوئی تعلق نہیں ہوگا۔ انہوں نے کہا ہے سب میں سنبھال لوں۔"),
    ("08-onboard-danish-ownership-2.mp3", "danish",
     "ٹھیک ہے ٹھیک ہے۔ ان کا نام عدنان شیخ ہے۔ وہ۔۔۔ وہ ایڈوائزر ہیں، اور ان کے والد صوبائی وزیر برائے انڈسٹریز ہیں۔ کوئی مسئلہ تو نہیں؟ سب بالکل لیجٹ ہے۔"),
    ("09-onboard-danish-risk.mp3", "danish",
     "تو آج ہی نمٹا سکتے ہیں؟ میں سپلائر کو کہہ چکا ہوں اکاؤنٹ تیار ہو جائے گا۔ متوقع ٹرن اوور — سیف رہنے کے لیے کہہ لیں مہینے کے پچاس لاکھ۔"),
    ("10-onboard-danish-edd.mp3", "danish",
     "اینہانسڈ ڈیو ڈیلیجنس؟ اس میں ہوتا کیا ہے؟ میں نے آپ کو سب کچھ دے دیا ہے۔"),
    ("11-onboard-danish-tipping.mp3", "danish",
     "دیکھیں، آپس کی بات ہے — میرا اکاؤنٹ کہیں رپورٹ تو نہیں ہو رہا؟ میں نے سنا ہے بینک لوگوں کو رپورٹ کرتے ہیں۔ اگر میرے خلاف کچھ فائل ہو تو مجھے پہلے بتائیے گا۔"),
    ("12-onboard-danish-monitor.mp3", "danish",
     "ٹھیک ہے۔ پھر اپنے مینیجر کے پاس بھیج دیں۔ اکاؤنٹ کھلنے کے بعد آپ اس کے ساتھ کیا کریں گے؟"),
    ("13-onboard-danish-restricted.mp3", "danish",
     "میرا اکاؤنٹ ریسٹرکٹ کیوں ہے؟ اس ہفتے میں نے اڑتالیس لاکھ جمع کرائے ہیں اور اب کچھ نہیں جا رہا۔ آپ نے کہا تھا سب ٹھیک ہے۔"),
    ("14-onboard-danish-whatnext.mp3", "danish",
     "اب کیا ہوگا؟ کیا میرا اکاؤنٹ چلا جائے گا؟"),
    ("15-radar-brief-marcus-1.mp3", "marcus",
     "پانچ ریڈ فلیگ فیملیز، اے سے ای، سیدھا اینیکسر ٹو سے۔ اگر آپ مشاہدے کی فیملی کا نام نہیں لے سکتے، تو درست فالو اپ سوال تک پہنچ ہی نہیں سکتے۔"),
    ("16-radar-brief-marcus-2.mp3", "marcus",
     "دس مشاہدے، ہر ایک اٹھارہ سیکنڈ۔ جلدی جواب دو تو کامبو ملٹیپلائر زندہ رہتا ہے۔"),
    ("17-console-brief-elena-1.mp3", "elena",
     "یہ لائیو کیو ہے۔ اس میں ہر کیس ایک حقیقی ٹرانزیکشن ہے جو آپ کے ڈسپوزیشن کا انتظار کر رہی ہے: کلیئر کریں، فلیگ کریں، یا ایسکلیٹ کریں۔"),
    ("18-console-brief-elena-2.mp3", "elena",
     "صرف فلیگ کرنا کافی نہیں۔ آپ کو وہ انڈیکیٹر نامزد کرنا ہوگا جس پر آپ عمل کر رہے ہیں، کیونکہ ایس ٹی آر میں فیصلے کی بنیاد درج ہونی چاہیے — اور نہ فائل کرنے کے فیصلے کی بھی۔"),
    ("19-thresholds-brief-elena-1.mp3", "elena",
     "تھریشولڈز وہ حصّہ ہیں جو گفتگو کے درمیان دیکھے نہیں جا سکتے۔ نقد میں بیس لاکھ روپے سی ٹی آر چالو کرتے ہیں، چاہے کچھ غلط نظر نہ آئے۔ واک اِن سے پانچ لاکھ شناخت کی تصدیق چالو کرتے ہیں۔ ایس ٹی آر کی کوئی نیچلی حد ہی نہیں۔"),
    ("20-thresholds-brief-elena-2.mp3", "elena",
     "بارہ ڈرلز، ہر ایک بائیس سیکنڈ۔ جہاں ایک سے زیادہ فرض لاگو ہو سکیں، اونچا فرض جیتتا ہے۔"),
]


async def one(outdir, name, speaker, text, voices):
    outdir.mkdir(parents=True, exist_ok=True)
    path = outdir / name
    voice, rate, pitch = voices[speaker]
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await comm.save(str(path))
    print(f"  {path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB)  [{voice}]")


async def run(label, lines, voices, outdir):
    print(f"Writing {len(lines)} {label} files to {outdir}")
    for name, speaker, text in lines:
        await one(outdir, name, speaker, text, voices)
    print(f"{label} done")


async def main():
    mode = (sys.argv[1] if len(sys.argv) > 1 else "ur").lower()
    if mode not in ("en", "ur", "all"):
        print("usage: python tools/generate_voices.py [en|ur|all]")
        sys.exit(1)
    if mode in ("en", "all"):
        await run("English", LINES_EN, VOICES_EN, OUT_EN)
    if mode in ("ur", "all"):
        await run("Urdu", LINES_UR, VOICES_UR, OUT_UR)


if __name__ == "__main__":
    asyncio.run(main())
