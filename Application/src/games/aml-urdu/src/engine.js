import { SENTINEL_UR } from './i18n-ur.js';
import { assetUrl } from './assetUrl.js';
window.SENTINEL_UR = SENTINEL_UR;

/* =====================================================================
   SENTINEL — AML/KYC Compliance Academy
   Content source: SBP AML/CFT Regulations for Banks & DFIs (to Dec 2019)
   as compiled in AML-KYC-Content-Notes-PoC.md
   Prototype / training PoC — not legal advice.
   ===================================================================== */

/* ---------------------------------------------------------------
   1. THRESHOLDS  (Content notes §2 — the deterministic logic layer)
   --------------------------------------------------------------- */
const RULES = {
  CTR_CASH: 2000000,       // cash transactions >= PKR 2,000,000 -> CTR, regardless of suspicion
  WALKIN_VERIFY: 500000,   // occasional/walk-in cash >= PKR 500,000 -> identity verification
  STR_MIN: 0,              // no minimum; includes attempted transactions
  BO_STANDARD: 20,         // beneficial ownership threshold %
  BO_EDD: 10,
  RETENTION_YEARS: 10
};
const PKR = n => 'PKR ' + n.toLocaleString('en-US');

/* ---------------------------------------------------------------
   2. RED-FLAG LIBRARY  (Content notes §3 — Annexure-II categories)
   --------------------------------------------------------------- */
const CATS = {
  A:{key:'A', name:'Inconsistent with customer profile', color:'#3B7DE8'},
  B:{key:'B', name:'Large cash activity',                color:'#E39A0C'},
  C:{key:'C', name:'Cross-border / wire concerns',       color:'#8B5CF6'},
  D:{key:'D', name:'Unidentified or unclear parties',    color:'#0FA98A'},
  E:{key:'E', name:'Suspicious account behaviour',       color:'#E2493C'}
};

const FLAGS = [
  {c:'A', t:'The customer moves funds constantly between several accounts they own, holding far more liquidity than their stated profile would explain.'},
  {c:'A', t:'Funds are withdrawn almost immediately after being deposited, with no plausible business reason offered.'},
  {c:'A', t:'A run of cash deposits at PKR 490,000 each — every one landing just below a reporting threshold.'},
  {c:'A', t:'Heavy cash turnover in an account whose declared business would normally settle by cheque or banking instrument.'},
  {c:'B', t:'The customer exchanges a large volume of small-denomination notes for high-denomination notes.'},
  {c:'B', t:'A large cash withdrawal from an account that sat dormant until an unexpected large credit arrived.'},
  {c:'B', t:'Several individuals queue at separate tellers at the same moment, each depositing large cash amounts.'},
  {c:'B', t:'A first-time customer wants to convert a bulk of cash without any account relationship being established.'},
  {c:'C', t:'A wire transfer to a jurisdiction of concern, with no business reason the customer can articulate.'},
  {c:'C', t:'A large incoming wire arrives with no logical business purpose for an account of this type.'},
  {c:'C', t:'A run of outgoing wires, each deliberately kept small enough to stay under reporting thresholds.'},
  {c:'C', t:'An incoming transfer arrives missing complete originator and beneficiary information.'},
  {c:'D', t:'Collateral is pledged by a third party who has no discernible relationship with the borrower.'},
  {c:'D', t:'A payment order carries inaccurate information about who actually placed it.'},
  {c:'D', t:'A nominee/trustee account is operating in a way inconsistent with the customer\u2019s stated business.'},
  {c:'D', t:'A guarantee is offered by an unknown party with no visible link to the transaction being financed.'},
  {c:'E', t:'The customer is reluctant to provide information, or offers details that are expensive and difficult to verify.'},
  {c:'E', t:'A dormant account suddenly receives deposits and is then drained by rapid withdrawals.'},
  {c:'E', t:'Several unrelated companies share one address and the same signatories, with no explanation.'},
  {c:'E', t:'A student account is receiving frequent large international wires.'}
];

/* ---------------------------------------------------------------
   3. GLOSSARY / VAULT  (Content notes §1 + §2 + §5)
   --------------------------------------------------------------- */
const GLOSSARY = [
  {k:'CDD', t:'KYC / Customer Due Diligence', d:'Identify the customer, verify identity against reliable documents or sources, understand the purpose of the relationship, and monitor the account on an ongoing basis for consistency with the known profile.', s:'Notes §1'},
  {k:'BO', t:'Beneficial Owner', d:'The real natural person who ultimately owns or controls the customer, or on whose behalf a transaction is conducted — not necessarily the named account holder. 20% shareholding under standard CDD, 10% under EDD.', s:'Notes §1, §4'},
  {k:'EDD', t:'Enhanced Due Diligence', d:'Extra scrutiny above standard CDD for higher-risk customers, products or geographies: additional detail on occupation, source of funds and wealth, senior management sign-off, and more frequent monitoring.', s:'Notes §1'},
  {k:'PEP', t:'Politically Exposed Person', d:'Someone holding a prominent public role — head of state, senior politician, judge, senior military or state-enterprise executive — plus close associates and family. Junior officials are not PEPs.', s:'Notes §1'},
  {k:'STR', t:'Suspicious Transaction Report', d:'Filed with the FMU regardless of amount, whenever a transaction is suspected of being linked to money laundering or terrorism financing — including attempted transactions that were never completed.', s:'Notes §1, §5'},
  {k:'CTR', t:'Currency Transaction Report', d:'Filed for cash transactions of PKR 2,000,000 and above. Mandatory on the amount alone — no suspicion is required and a plausible explanation does not remove the obligation.', s:'Notes §2'},
  {k:'PKR 500K', t:'Walk-in Verification Threshold', d:'Identity verification is required for occasional or walk-in customers conducting cash transactions of PKR 500,000 or above — whether a single transaction or several that appear to be linked.', s:'Notes §2'},
  {k:'NPO', t:'NGO / NPO / Charity Accounts', d:'Automatic EDD and senior management approval, regardless of transaction size. The risk attaches to the customer type itself, not to the amount being moved.', s:'Notes §2'},
  {k:'10 YRS', t:'Record Retention', d:'Transaction records are kept for 10 years from the transaction date. Identification records are kept for 10 years after the relationship ends.', s:'Notes §2'},
  {k:'TIP-OFF', t:'Prohibition on Tipping Off', d:'Employees are strictly prohibited from disclosing to a customer that an STR has been or is being filed. Tipping off is itself a disciplinable and reportable offence.', s:'Notes §5'},
  {k:'FMU', t:'Financial Monitoring Unit', d:'The authority STRs are filed with. The basis for deciding to file — or not to file — must be documented either way, and the reporting duty cannot be delegated to outsourced staff.', s:'Notes §5'},
  {k:'BIOMETRIC', t:'Verification at Onboarding', d:'Identity must be checked against a reliable source. For Pakistani nationals, biometric verification through NADRA is mandatory before a new relationship is established, except in defined exception cases.', s:'Notes §4'}
];

/* ---------------------------------------------------------------
   4. CDD DIALOGUE SIMULATION  (Content notes §4 + §5)
   --------------------------------------------------------------- */
const CDD_STEPS = ['Identify','Verify','Ownership','Risk','Monitor'];

const DIALOGUE = {
  persona:{name:'Danish Raza', role:'Walk-in — new account application', seed:7},
  intro:'A man approaches your desk at the branch. He wants to open a current account for a private limited company registered three weeks ago.',
  beats:[
    {
      step:0,
      say:'Good morning. I want to open a current account for my company — Raza Trading Private Limited. I have the incorporation certificate here, and my own CNIC.',
      voice:'05-onboard-danish-identify.mp3',
      choices:[
        {t:'Thank you. Alongside the certificate and your CNIC, I\u2019ll need the nature of the business, the purpose of the account, your source of earnings and your expected monthly turnover.', v:'good',
         f:'Correct. Identification is not just a name and an ID number — the CDD identification step covers nature of business, purpose of the account, source of earnings and expected turnover. Collecting it now is what makes later monitoring possible.', cite:'CDD flow — step 1 (Identify)'},
        {t:'The certificate and CNIC are all we need to get started. We can fill in the rest later once the account is running.', v:'bad',
         f:'Incomplete identification. Purpose of account, source of earnings and expected turnover must be obtained at onboarding — without a declared profile there is no baseline against which to judge whether future transactions are consistent.', cite:'CDD flow — step 1 (Identify)'},
        {t:'Let me take a copy of the certificate, and I\u2019ll ask you a few questions about the business as we go.', v:'meh',
         f:'Partly right — you will get there, but identification works best as a deliberate, complete step. Leaving it open-ended risks gaps in exactly the fields (turnover, source of earnings) you will need later.', cite:'CDD flow — step 1 (Identify)'}
      ]
    },
    {
      step:1,
      say:'Here is the CNIC. Look — the photo is clearly me. That\u2019s enough, isn\u2019t it? I\u2019m in a bit of a rush, I have a flight this evening.',
      voice:'06-onboard-danish-verify.mp3',
      choices:[
        {t:'I do have to verify it against NADRA biometrically before the relationship can be established. It only takes a moment.', v:'good',
         f:'Correct. Verification means checking the identity against a reliable independent source — biometric verification through NADRA is mandatory for Pakistani nationals before a new relationship is established. Time pressure from the customer does not create an exception.', cite:'CDD flow — step 2 (Verify)'},
        {t:'Since the photo matches and you\u2019re in a hurry, I\u2019ll accept the CNIC and complete the biometric check after the account is opened.', v:'bad',
         f:'Verification cannot be deferred. Visual comparison of a photo is not verification against a reliable source, and biometric verification is required before — not after — the relationship is established.', cite:'CDD flow — step 2 (Verify)'},
        {t:'I\u2019ll take a photocopy and have a colleague confirm the details from our internal records.', v:'bad',
         f:'Internal records are not an independent reliable source for a new customer, and a photocopy is not verification. The biometric check against NADRA is the required step here.', cite:'CDD flow — step 2 (Verify)'}
      ]
    },
    {
      step:2,
      say:'The company shares? I hold 15%. My brother-in-law holds most of it — around 60% — but he\u2019s a silent partner, he won\u2019t be involved in the account at all. He asked me to handle all of it.',
      voice:'07-onboard-danish-ownership-1.mp3',
      choices:[
        {t:'Because the customer is a company, I need to identify whoever ultimately owns or controls it. A 60% holder is a beneficial owner and has to be identified and verified, silent partner or not.', v:'good',
         f:'Correct. The beneficial owner is the real natural person who ultimately owns or controls the customer — well past the 20% standard threshold here. Not operating the account does not remove him from scope.', cite:'CDD flow — step 3 (Beneficial ownership), 20% threshold'},
        {t:'If he isn\u2019t going to operate the account, we only need details for you as the signatory.', v:'bad',
         f:'This is the classic beneficial ownership miss. The named account holder or signatory is not necessarily the beneficial owner — the whole point of the step is to look through to whoever actually owns or controls the entity.', cite:'CDD flow — step 3 (Beneficial ownership)'},
        {t:'I\u2019ll note him in the file as a shareholder and we can collect his documents if the account becomes active.', v:'bad',
         f:'Beneficial ownership is identified and verified at onboarding, not conditionally later. A 60% holder must be identified before the relationship proceeds.', cite:'CDD flow — step 3 (Beneficial ownership)'}
      ]
    },
    {
      step:2,
      say:'Fine, fine. His name is Adnan Sheikh. He is... he serves as an advisor and his father is the provincial minister for industries. Is that a problem? Everything is completely legitimate.',
      voice:'08-onboard-danish-ownership-2.mp3',
      choices:[
        {t:'It isn\u2019t a problem, but it does change the process. A minister\u2019s immediate family member falls within PEP scope, which means additional steps before we can proceed.', v:'good',
         f:'Correct. PEP scope covers close associates and family members of people holding prominent public functions — a provincial minister\u2019s son is in scope. Recognising it early is what routes the file to the right process.', cite:'Core concepts — PEP definition'},
        {t:'His father\u2019s position isn\u2019t relevant — your brother-in-law isn\u2019t a public official himself, so we can carry on normally.', v:'bad',
         f:'Incorrect. The PEP definition explicitly extends to close associates and family members, not only the office-holder. Treating this as an ordinary file skips the controls the risk exists for.', cite:'Core concepts — PEP definition'},
        {t:'That makes this account too risky. I\u2019m afraid we can\u2019t open it.', v:'meh',
         f:'Being a PEP is not a prohibition. The regulation requires enhanced measures and senior management approval — not automatic refusal. Declining outright is over-correction, and it forfeits a legitimate relationship.', cite:'Core concepts — PEP handling'}
      ]
    },
    {
      step:3,
      risk:true,
      say:'So can we finish this today? I have already told my supplier the account would be ready. Expected turnover — let\u2019s say around 5 million a month to be safe.',
      voice:'09-onboard-danish-risk.mp3',
      note:'Three-week-old company · PKR 5,000,000 declared monthly turnover · beneficial owner within PEP scope · customer applying time pressure.',
      choices:[
        {t:'Route the file to Enhanced Due Diligence.', v:'good', branch:'edd',
         f:'Correct risk assessment. A PEP-linked beneficial owner alone requires enhanced measures; combined with a three-week-old company declaring PKR 5,000,000 monthly turnover, EDD is clearly the right call.', cite:'CDD flow — step 4 (Risk assessment) → EDD path'},
        {t:'Proceed with standard CDD — the documents are all in order.', v:'bad', branch:'standard',
         f:'Under-assessed. Documents being in order says nothing about risk level. A PEP-linked beneficial owner mandates enhanced measures and senior management approval regardless of how clean the paperwork looks.', cite:'CDD flow — step 4 (Risk assessment)'},
        {t:'Apply simplified due diligence to get it opened today.', v:'bad', branch:'standard',
         f:'Simplified due diligence is reserved for demonstrably low-risk situations. Applying it to a PEP-linked file with an unexplained turnover figure inverts the risk-based approach entirely.', cite:'CDD flow — step 4 (Risk assessment)'}
      ]
    }
  ],
  /* branch: EDD path */
  edd:[
    {
      step:3,
      say:'Enhanced due diligence? What does that involve? I have given you everything already.',
      voice:'10-onboard-danish-edd.mp3',
      choices:[
        {t:'For this file I need documented source of wealth for the beneficial owner, and senior management approval before the relationship can be established.', v:'good',
         f:'Correct. PEP handling requires senior management approval to open or continue the relationship, source-of-wealth documentation, and enhanced ongoing monitoring. All three, not one of them.', cite:'Key thresholds — PEP handling'},
        {t:'Mainly it means we will watch the account more closely once it is open.', v:'meh',
         f:'Enhanced monitoring is part of it, but only part. Source-of-wealth documentation and senior management sign-off are required before the relationship is established — monitoring alone is not EDD.', cite:'Key thresholds — PEP handling'},
        {t:'It just means more paperwork on our side, nothing you need to worry about.', v:'bad',
         f:'This misrepresents the process to the customer and skips the substantive requirements: documented source of wealth and senior management approval are obligations, not internal paperwork.', cite:'Key thresholds — PEP handling'}
      ]
    },
    {
      step:4,
      say:'Look — between us, is my account going to get reported to someone? I have heard banks report people. If anything gets filed on me I want to know about it first.',
      voice:'11-onboard-danish-tipping.mp3',
      choices:[
        {t:'I can tell you what documents we need and how long approval takes. I can\u2019t discuss internal reporting, and I won\u2019t be able to in future either.', v:'good',
         f:'Correct handling. You stayed helpful on process without ever confirming or denying reporting activity. Disclosing that an STR has been or is being filed is prohibited — declining the topic cleanly is the safe path.', cite:'Reporting obligations — tipping off'},
        {t:'Don\u2019t worry — nothing has been filed on you, and if anything ever is I\u2019ll let you know.', v:'bad',
         f:'This is tipping off. Confirming reporting status either way — and promising future notice — is explicitly prohibited and is itself a disciplinable and reportable offence.', cite:'Reporting obligations — tipping off'},
        {t:'Files like yours do sometimes get flagged internally, but I wouldn\u2019t be too concerned about it.', v:'bad',
         f:'Also tipping off. Hinting at flagging discloses internal reporting activity just as effectively as stating it outright. The hedged wording offers no protection.', cite:'Reporting obligations — tipping off'}
      ]
    },
    {
      step:4,
      say:'All right. Send it to your manager then. How will you handle the account once it opens?',
      voice:'12-onboard-danish-monitor.mp3',
      choices:[
        {t:'It will be subject to enhanced ongoing monitoring — transactions checked against the profile you\u2019ve declared, and reviewed more frequently than a standard account.', v:'good',
         f:'Correct close. Ongoing monitoring is the final CDD step, and for a PEP-linked relationship it runs at enhanced frequency. The declared profile you captured at step 1 is exactly what monitoring measures against.', cite:'CDD flow — step 5 (Ongoing monitoring)'},
        {t:'Once approval comes through it runs like any other current account.', v:'bad',
         f:'Incorrect. Enhanced ongoing monitoring is a continuing obligation for higher-risk relationships — approval at onboarding does not reset the file to standard treatment.', cite:'CDD flow — step 5 (Ongoing monitoring)'},
        {t:'We will review it again at the annual refresh like everything else.', v:'meh',
         f:'Too passive. An annual refresh is not enhanced ongoing monitoring — higher-risk relationships need more frequent review and transaction-level consistency checks against the declared profile.', cite:'CDD flow — step 5 (Ongoing monitoring)'}
      ]
    }
  ],
  /* branch: standard path — consequences surface later */
  standard:[
    {
      step:4,
      sys:'The account is opened under standard due diligence. Eleven days later, the monitoring system escalates the relationship back to your desk.',
      say:'Why is my account restricted? I deposited 4.8 million this week and now nothing is going through. You told me everything was fine.',
      voice:'13-onboard-danish-restricted.mp3',
      choices:[
        {t:'The activity doesn\u2019t match the profile recorded at onboarding, so the file is under review. I can\u2019t discuss the detail, but I can tell you what we need from you.', v:'good',
         f:'Best available recovery. You acknowledged the review without disclosing reporting activity, and you anchored it to the declared profile. But note the position you are in: the enhanced controls skipped at onboarding are being retrofitted under pressure.', cite:'Reporting obligations — tipping off'},
        {t:'Honestly, your account was flagged by our compliance system. I think a report has gone in.', v:'bad',
         f:'Tipping off. Disclosing that an account has been flagged or that a report has gone in is explicitly prohibited and is itself a reportable offence — compounding the original assessment error.', cite:'Reporting obligations — tipping off'},
        {t:'There must be a system error. Let me get it lifted so your payments go through.', v:'bad',
         f:'Worse. Overriding a monitoring escalation to release funds — without any review of why the alert triggered — defeats the entire monitoring control.', cite:'CDD flow — step 5 (Ongoing monitoring)'}
      ]
    },
    {
      step:4,
      say:'So what happens now? Am I going to lose the account?',
      voice:'14-onboard-danish-whatnext.mp3',
      choices:[
        {t:'The file goes for enhanced due diligence retrospectively — source of wealth for the beneficial owner, and senior management approval to continue the relationship.', v:'good',
         f:'Correct. Enhanced measures and senior management approval are required to open or continue a PEP-linked relationship — applying them late is still better than not applying them, and the decision basis must be documented either way.', cite:'Key thresholds — PEP handling'},
        {t:'Nothing much — I\u2019ll close the alert and note that you explained it.', v:'bad',
         f:'A customer explanation is not a substitute for the EDD that was owed at onboarding, and the basis for any decision — including a decision not to file — must be documented.', cite:'Reporting obligations — documentation'}
      ]
    }
  ]
};

/* ---------------------------------------------------------------
   5. TRANSACTION REVIEW CASES  (Content notes §2 thresholds + §3 flags)
   --------------------------------------------------------------- */
const CUSTOMERS = {
  tariq:{name:'M. Tariq Enterprises', business:'Wholesale textile trading', type:'Current — business', turnover:'PKR 800,000 / month', since:'March 2023', risk:'low', seed:3},
  sana: {name:'Sana Iqbal', business:'Salaried — university student', type:'Savings — individual', turnover:'PKR 45,000 / month', since:'August 2024', risk:'med', seed:11},
  hilal:{name:'Hilal Welfare Trust', business:'Registered charity / NPO', type:'Current — non-profit', turnover:'PKR 1,200,000 / month', since:'January 2022', risk:'high', seed:5},
  waqar:{name:'Waqar Motors', business:'Used vehicle dealership', type:'Current — business', turnover:'PKR 3,500,000 / month', since:'June 2019', risk:'med', seed:9}
};

const CASES = [
  {
    id:'CASE-001', cust:'tariq', amount:350000, type:'Cash deposit',
    details:[['Counterparty','Walk-in, self'],['Time','11:42 AM'],['Pattern','Consistent with stated turnover']],
    narrative:'Routine cash deposit into the business account. Amount and frequency are consistent with the customer\u2019s declared textile trading turnover.',
    correct:'clear', category:'baseline',
    why:'Below the PKR 500,000 walk-in verification threshold, far below the PKR 2,000,000 CTR threshold, and consistent with the stated business profile. Nothing here requires action — clearing is correct.'
  },
  {
    id:'CASE-002', cust:'tariq', amount:480000, type:'Cash deposit',
    details:[['Counterparty','Walk-in, self'],['Pattern','4th deposit this week, PKR 470,000\u2013490,000'],['Note','Each individually below threshold']],
    narrative:'Four cash deposits this week, each between PKR 470,000 and 490,000 — every one landing just under the PKR 500,000 verification threshold.',
    correct:'flag', category:'structuring',
    reasons:['Structuring below threshold','Unusual frequency','Large cash activity'],
    correctReasons:[0,1,2],
    decoys:['High-risk jurisdiction','Dormant account reactivation'],
    why:'Individually unremarkable, but the pattern across the week is textbook structuring — deposits shaped to fall just below the identification threshold. Note that apparently-linked cash transactions are assessed together, not one by one.'
  },
  {
    id:'CASE-003', cust:'waqar', amount:2600000, type:'Incoming wire transfer',
    details:[['Origin','Jurisdiction of FATF concern'],['Originator info','Incomplete'],['Stated purpose','Not provided']],
    narrative:'Large incoming wire from a jurisdiction of specific FATF concern. The accompanying message is missing complete originator information and no purpose has been stated.',
    correct:'escalate', category:'cross_border',
    reasons:['High-risk jurisdiction','Incomplete originator info','No stated purpose'],
    correctReasons:[0,1,2],
    decoys:['Structuring below threshold','Dormant account reactivation'],
    why:'Missing originator information on a cross-border wire from a high-risk jurisdiction requires enhanced due diligence and senior review before funds are processed. This is beyond a routine flag. (Note: CTR is a cash-transaction report — it does not attach to a wire.)'
  },
  {
    id:'CASE-004', cust:'tariq', amount:90000, type:'Outgoing wire transfer',
    details:[['Beneficiary','Registered supplier, Faisalabad'],['Pattern','Matches prior 6 months'],['Purpose','Fabric stock purchase']],
    narrative:'Regular outgoing payment to a known textile supplier, consistent with the customer\u2019s established purchasing pattern over the past six months.',
    correct:'clear', category:'baseline',
    why:'Consistent counterparty, consistent purpose, consistent amount range. Normal business activity for this profile — clearing is correct. Flagging clean activity has a real cost: it buries genuine alerts.'
  },
  {
    id:'CASE-005', cust:'waqar', amount:1850000, type:'Cash withdrawal',
    details:[['Account status','Dormant 11 months prior'],['Trigger','Large unexpected credit 2 days ago'],['Note','Withdrawal same week as credit']],
    narrative:'The account was dormant for nearly a year. Two days ago it received an unexpectedly large credit, and the customer is now requesting a large cash withdrawal in the same week.',
    correct:'flag', category:'dormant_activation',
    reasons:['Dormant account reactivation','Rapid fund movement','Inconsistent with profile'],
    correctReasons:[0,1,2],
    decoys:['Exceeds CTR threshold','High-risk jurisdiction'],
    why:'A large cash withdrawal from a previously dormant account that just received an unexpected large credit is a specifically listed indicator. Note the amount sits below PKR 2,000,000, so the CTR obligation is not what drives this — the pattern is.'
  },
  {
    id:'CASE-006', cust:'tariq', amount:3200000, type:'Cash deposit',
    details:[['Counterparty','Walk-in, self'],['Note','Single transaction'],['Pattern','Matches known seasonal stock cycle']],
    narrative:'A single large cash deposit ahead of the customer\u2019s known seasonal textile stock purchase — a pattern this account has shown for two years running.',
    correct:'escalate', category:'ctr_threshold',
    reasons:['Exceeds CTR threshold','Mandatory reporting regardless of explanation'],
    correctReasons:[0,1],
    decoys:['Structuring below threshold','Inconsistent with profile'],
    why:'This crosses the PKR 2,000,000 CTR threshold. A Currency Transaction Report is mandatory on the amount alone — how plausible the seasonal explanation sounds is irrelevant to the obligation. Clearing it would miss a mandatory report.'
  },
  {
    id:'CASE-007', cust:'sana', amount:640000, type:'Incoming wire transfer',
    details:[['Origin','Overseas — third party'],['Frequency','5th such transfer in 8 weeks'],['Declared income','PKR 45,000 / month']],
    narrative:'A student account with PKR 45,000 declared monthly income has received its fifth large overseas wire in eight weeks, each from a third party with no stated relationship to the account holder.',
    correct:'flag', category:'profile_mismatch',
    reasons:['Inconsistent with stated occupation','Unexplained third party','Unusual frequency'],
    correctReasons:[0,1,2],
    decoys:['Exceeds CTR threshold','Dormant account reactivation'],
    why:'Stated occupation not matching transaction volume is a listed indicator — a student receiving frequent large international wires is the textbook example. The amount alone triggers nothing; the mismatch against the declared profile is the issue.'
  },
  {
    id:'CASE-008', cust:'hilal', amount:410000, type:'Outgoing transfer',
    details:[['Beneficiary','Overseas partner organisation'],['Customer type','Registered NPO'],['Approval on file','None']],
    narrative:'A registered charity is transferring funds to an overseas partner organisation. The amount is modest and the stated purpose is a relief programme. No senior management approval is recorded on the relationship file.',
    correct:'escalate', category:'npo_edd',
    reasons:['NPO customer — automatic EDD','Senior management approval missing','Cross-border element'],
    correctReasons:[0,1,2],
    decoys:['Exceeds CTR threshold','Structuring below threshold'],
    why:'NGO, NPO and charity accounts carry automatic EDD and require senior management approval regardless of transaction size. The modest amount is a distraction — the obligation attaches to the customer type, and the approval gap has to be resolved.'
  },
  {
    id:'CASE-009', cust:'waqar', amount:1400000, type:'Cash deposit',
    details:[['Counterparty','Walk-in, self'],['Note','Vehicle sale proceeds, receipt provided'],['Pattern','Within normal monthly range']],
    narrative:'Cash deposit of vehicle sale proceeds, supported by a signed sale receipt matching the amount. The dealership regularly deposits sums in this range.',
    correct:'clear', category:'baseline',
    why:'Below the PKR 2,000,000 CTR threshold, documented, and consistent with a dealership profile where cash settlement is normal. This one tests whether a large-looking number pulls you into flagging — the threshold and the profile both say clear.'
  }
];

const ACTION_LABELS = {
  clear:{n:'Clear', d:'No action required', c:'var(--teal)'},
  flag:{n:'Flag as suspicious', d:'STR consideration', c:'var(--amber)'},
  escalate:{n:'Escalate', d:'EDD / mandatory report', c:'var(--coral)'}
};

/* ---------------------------------------------------------------
   6. THRESHOLD TRAINER — procedural drill generator
   Priority of obligation: STR > EDD > CTR > VERIFY > NONE
   --------------------------------------------------------------- */
const TT_OPTIONS = [
  {k:'NONE',   n:'No report required', d:'Process normally, monitor as usual'},
  {k:'VERIFY', n:'Verify identity',    d:'Walk-in CDD before processing'},
  {k:'CTR',    n:'File a CTR',         d:'Currency Transaction Report'},
  {k:'STR',    n:'File an STR',        d:'Suspicious Transaction Report — FMU'},
  {k:'EDD',    n:'Enhanced due diligence', d:'Senior management approval required'}
];

/* Deterministic rule engine — the "simulator logic hook" from the notes */
function resolveObligation(tx){
  const O = UR().obligation || {};
  if (tx.suspicion) return {k:'STR', why: isUr() && O.str ? O.str : 'Suspicion is present, so an STR is filed regardless of amount — there is no minimum, and the duty extends to attempted transactions. Suspicion outranks every other trigger here.'};
  if (tx.party === 'pep') return {k:'EDD', why: isUr() && O.pep ? O.pep : 'A PEP relationship requires senior management approval, documented source of wealth and enhanced ongoing monitoring. The obligation attaches to who the customer is, not to the size of this transaction.'};
  if (tx.party === 'npo') return {k:'EDD', why: isUr() && O.npo ? O.npo : 'NGO, NPO and charity accounts carry automatic EDD and senior management approval regardless of transaction size.'};
  if (tx.cash && tx.amount >= RULES.CTR_CASH) return {k:'CTR', why: isUr()
    ? (PKR(tx.amount) + ' نقد لین دین بیس لاکھ روپے کی حد پر یا اس سے اوپر ہے، اس لیے کرنسی ٹرانزیکشن رپورٹ صرف رقم پر لازمی ہے — شبہ درکار نہیں۔')
    : ('A cash transaction of ' + PKR(tx.amount) + ' is at or above the PKR 2,000,000 threshold, so a Currency Transaction Report is mandatory on the amount alone — no suspicion needed.')};
  if (tx.cash && tx.party === 'walkin' && tx.amount >= RULES.WALKIN_VERIFY) return {k:'VERIFY', why: isUr()
    ? ('واک اِن کسٹمر کا ' + PKR(tx.amount) + ' نقد لین دین پانچ لاکھ روپے کی حد پر یا اس سے اوپر ہے، اس لیے پروسیس سے پہلے شناخت کی تصدیق لازمی ہے۔')
    : ('A walk-in customer conducting a cash transaction of ' + PKR(tx.amount) + ' is at or above the PKR 500,000 mark, so identity verification is required before processing.')};
  return {k:'NONE', why: isUr()
    ? ('کوئی حد نہیں ٹوٹی اور کچھ مشکوک نہیں: ' + PKR(tx.amount) + (tx.cash ? (O.noneSuffixCash||'') : (O.noneSuffixXfer||'')) + (O.noneFor||''))
    : ('No threshold is crossed and nothing suspicious is present: ' + PKR(tx.amount) + (tx.cash ? ' in cash' : ' by transfer') + ' for an established customer. Ordinary monitoring continues.')};
}

/* =====================================================================
   GRAPHICS — everything below is generated as inline SVG / canvas.
   No image assets, no icon library.
   ===================================================================== */

/* ---- hero: bank facade + vault door ---- */
function artBankVault(){
  return `
  <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2E4256"/><stop offset="1" stop-color="#18242F"/>
      </linearGradient>
      <linearGradient id="gT" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2BD9B0"/><stop offset="1" stop-color="#4C8DF6"/>
      </linearGradient>
      <radialGradient id="gGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#2BD9B0" stop-opacity=".38"/>
        <stop offset="1" stop-color="#2BD9B0" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="150" cy="150" rx="128" ry="112" fill="url(#gGlow)"/>
    <!-- pediment -->
    <path d="M150 24 L262 74 H38 Z" fill="url(#gA)" stroke="#3C5468" stroke-width="1.5"/>
    <path d="M150 38 L232 74 H68 Z" fill="#101A24" opacity=".6"/>
    <!-- columns -->
    <g fill="url(#gA)" stroke="#3C5468" stroke-width="1.2">
      <rect x="52"  y="80" width="20" height="98" rx="3"/>
      <rect x="88"  y="80" width="20" height="98" rx="3"/>
      <rect x="192" y="80" width="20" height="98" rx="3"/>
      <rect x="228" y="80" width="20" height="98" rx="3"/>
    </g>
    <g stroke="#243444" stroke-width="1" opacity=".8">
      <path d="M58 84v90M66 84v90M94 84v90M102 84v90M198 84v90M206 84v90M234 84v90M242 84v90"/>
    </g>
    <!-- steps + base -->
    <rect x="34" y="178" width="232" height="10" rx="2" fill="#22323F"/>
    <rect x="26" y="188" width="248" height="10" rx="2" fill="#1B2934"/>
    <rect x="18" y="198" width="264" height="11" rx="2" fill="#16222C"/>
    <!-- vault door -->
    <circle cx="150" cy="132" r="46" fill="#101A24" stroke="#3C5468" stroke-width="2"/>
    <circle cx="150" cy="132" r="38" fill="#16232F" stroke="#2E4155" stroke-width="1.5"/>
    <circle cx="150" cy="132" r="27" fill="none" stroke="url(#gT)" stroke-width="2" stroke-dasharray="10 7" opacity=".9">
      <animateTransform attributeName="transform" type="rotate" from="0 150 132" to="360 150 132" dur="16s" repeatCount="indefinite"/>
    </circle>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="360 150 132" to="0 150 132" dur="11s" repeatCount="indefinite"/>
      <circle cx="150" cy="132" r="13" fill="#0C141C" stroke="url(#gT)" stroke-width="2"/>
      <g stroke="url(#gT)" stroke-width="3" stroke-linecap="round">
        <path d="M150 119v-11M150 145v11M137 132h-11M163 132h11"/>
      </g>
    </g>
    <!-- bolts -->
    <g fill="#2BD9B0" opacity=".75">
      <circle cx="150" cy="93" r="2.6"/><circle cx="150" cy="171" r="2.6"/>
      <circle cx="111" cy="132" r="2.6"/><circle cx="189" cy="132" r="2.6"/>
    </g>
    <!-- floating alert chips -->
    <g opacity=".95">
      <g transform="translate(232 108)">
        <animateTransform attributeName="transform" type="translate" values="232 108;232 100;232 108" dur="4.4s" repeatCount="indefinite"/>
        <rect x="-19" y="-13" width="38" height="26" rx="7" fill="#1B2B22" stroke="#2BD9B0" stroke-width="1.3"/>
        <path d="M-6 0l4.4 4.6L8-4.6" stroke="#2BD9B0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(64 152)">
        <animateTransform attributeName="transform" type="translate" values="64 152;64 143;64 152" dur="5.6s" repeatCount="indefinite"/>
        <rect x="-19" y="-13" width="38" height="26" rx="7" fill="#2E2415" stroke="#F2B138" stroke-width="1.3"/>
        <path d="M0-6.5v7" stroke="#F2B138" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="0" cy="5" r="1.6" fill="#F2B138"/>
      </g>
    </g>
  </svg>`;
}

/* ---- procedural customer avatar ---- */
function avatar(seed, mood){
  mood = mood || 'neutral';
  const skins  = ['#E3B183','#D49A6E','#C4835A','#AD6E48','#EFC49B'];
  const hairs  = ['#241C14','#3A2A1B','#141414','#4B3826','#5C4630'];
  const shirts = ['#2C4A6B','#35553F','#553546','#4A4630','#33455C'];
  const s = skins[seed % skins.length];
  const h = hairs[(seed*3) % hairs.length];
  const c = shirts[(seed*5) % shirts.length];
  const beard = seed % 3 === 0;
  const glasses = seed % 4 === 1;

  const mouths = {
    neutral:'M50 78 Q60 82 70 78',
    pleased:'M49 76 Q60 87 71 76',
    tense:'M50 80 Q60 76 70 80',
    annoyed:'M50 81 Q60 74 70 81'
  };
  const brows = {
    neutral:['M43 52 L54 51','M66 51 L77 52'],
    pleased:['M43 52 L54 50','M66 50 L77 52'],
    tense:  ['M43 49 L54 53','M66 53 L77 49'],
    annoyed:['M43 48 L54 54','M66 54 L77 48']
  };

  return `
  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="av${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1D2B3A"/><stop offset="1" stop-color="#111A24"/>
      </linearGradient>
      <clipPath id="avc${seed}"><circle cx="60" cy="60" r="56"/></clipPath>
    </defs>
    <circle cx="60" cy="60" r="57" fill="url(#av${seed})" stroke="#2E4155" stroke-width="2"/>
    <g clip-path="url(#avc${seed})">
      <!-- shoulders -->
      <path d="M14 122c0-19 17-30 46-30s46 11 46 30z" fill="${c}"/>
      <path d="M60 92l-9 9 9 21 9-21z" fill="#E9EFF5" opacity=".92"/>
      <path d="M60 101l-5 6 5 15 5-15z" fill="#8FA3B8" opacity=".55"/>
      <!-- neck + head -->
      <rect x="52" y="76" width="16" height="20" rx="7" fill="${s}" opacity=".85"/>
      <ellipse cx="60" cy="58" rx="24" ry="28" fill="${s}"/>
      <!-- ears -->
      <circle cx="36.5" cy="60" r="4.4" fill="${s}"/><circle cx="83.5" cy="60" r="4.4" fill="${s}"/>
      <!-- hair -->
      <path d="M36 54c0-16 10-25 24-25s24 9 24 25c0-7-8-11-24-11s-24 4-24 11z" fill="${h}"/>
      ${beard ? `<path d="M38 62c2 18 11 26 22 26s20-8 22-26c-4 12-12 15-22 15s-18-3-22-15z" fill="${h}" opacity=".9"/>` : ''}
      <!-- eyes -->
      <ellipse cx="50" cy="60" rx="4.2" ry="4.6" fill="#F6F9FB"/>
      <ellipse cx="70" cy="60" rx="4.2" ry="4.6" fill="#F6F9FB"/>
      <circle cx="50.6" cy="60.6" r="2.2" fill="#1A2530"/><circle cx="70.6" cy="60.6" r="2.2" fill="#1A2530"/>
      ${glasses ? `<g stroke="#8FA3B8" stroke-width="1.6" fill="none" opacity=".9">
         <circle cx="50" cy="60" r="8"/><circle cx="70" cy="60" r="8"/><path d="M58 60h4M42 58l-6-2M78 58l6-2"/></g>` : ''}
      <!-- brows -->
      <g stroke="${h}" stroke-width="3" stroke-linecap="round">${brows[mood].map(p=>`<path d="${p}"/>`).join('')}</g>
      <!-- nose + mouth -->
      <path d="M60 62v8l-3.4 2.6" stroke="rgba(0,0,0,.28)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="${mouths[mood]}" stroke="rgba(0,0,0,.55)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

/* ---- rank shield ---- */
function rankBadge(stars){
  const pts = [];
  const n = Math.max(1, stars);
  for (let i=0;i<n;i++){
    const x = 20 + (i - (n-1)/2) * 6.4;
    pts.push(`<circle cx="${x.toFixed(1)}" cy="25" r="1.9" fill="#C9962C"/>`);
  }
  return `
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0FA98A"/><stop offset="1" stop-color="#3B7DE8"/>
    </linearGradient></defs>
    <path d="M20 3l14 5v12c0 8.6-5.8 14.8-14 17-8.2-2.2-14-8.4-14-17V8z" fill="rgba(15,169,138,.10)" stroke="url(#rb)" stroke-width="1.8"/>
    <path d="M20 11l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="url(#rb)" opacity=".92"/>
    ${pts.join('')}
  </svg>`;
}

/* ---- radar dish ---- */
function radarSVG(){
  return `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0FA98A" stop-opacity="0"/>
        <stop offset="1" stop-color="#0FA98A" stop-opacity=".55"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="92" fill="#F5F8FB" stroke="#DCE6EF" stroke-width="1.4"/>
    <g fill="none" stroke="#DCE6EF" stroke-width="1">
      <circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="47"/><circle cx="100" cy="100" r="24"/>
      <path d="M100 8v184M8 100h184"/>
      <path d="M35 35l130 130M165 35L35 165" opacity=".5"/>
    </g>
    <path class="rsweep" d="M100 100 L192 100 A92 92 0 0 0 165 35 Z" fill="url(#sw)"/>
    <g class="rblip" fill="#0FA98A">
      <circle cx="142" cy="66" r="3.4"/><circle cx="70" cy="132" r="2.6" opacity=".7"/>
      <circle cx="122" cy="140" r="2.2" opacity=".5"/>
    </g>
    <circle cx="100" cy="100" r="4" fill="#0FA98A"/>
    <circle cx="100" cy="100" r="4" fill="none" stroke="#0FA98A" stroke-width="1.4">
      <animate attributeName="r" values="4;40;4" dur="3.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".9;0;0" dur="3.4s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
}

/* ---- threshold thermometer for a transaction amount ---- */
function thermoSVG(amount, isCash){
  const max = 4000000;
  const p = v => Math.min(100, (v/max)*100);
  const x = p(amount);
  const cVerify = p(RULES.WALKIN_VERIFY);
  const cCtr = p(RULES.CTR_CASH);
  const col = !isCash ? '#3B7DE8' : amount >= RULES.CTR_CASH ? '#E2493C' : amount >= RULES.WALKIN_VERIFY ? '#E39A0C' : '#0FA98A';
  return `
  <svg viewBox="0 0 400 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="22" width="400" height="8" rx="4" fill="#DCE6EF"/>
    <rect x="0" y="22" width="${(x*4).toFixed(1)}" height="8" rx="4" fill="${col}"/>
    <g font-family="IBM Plex Mono, monospace" font-size="8" fill="#6B7F92">
      <line x1="${(cVerify*4).toFixed(1)}" y1="14" x2="${(cVerify*4).toFixed(1)}" y2="38" stroke="#E39A0C" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="${(cVerify*4+4).toFixed(1)}" y="12">${t('verifyMark','500K · verify')}</text>
      <line x1="${(cCtr*4).toFixed(1)}" y1="14" x2="${(cCtr*4).toFixed(1)}" y2="38" stroke="#E2493C" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="${(cCtr*4+4).toFixed(1)}" y="12">2M · CTR</text>
    </g>
    <circle cx="${(x*4).toFixed(1)}" cy="26" r="6" fill="${col}" stroke="#FFFFFF" stroke-width="2"/>
    <text x="${Math.min(340,x*4).toFixed(1)}" y="49" font-family="IBM Plex Mono, monospace" font-size="9" fill="${col}">${isCash?t('cash','cash'):t('transfer','transfer')}</text>
  </svg>`;
}

/* ---- semicircular gauge for the threshold trainer ---- */
function gaugeSVG(amount, cash){
  const max = 3000000;
  const frac = Math.min(1, amount/max);
  const ang = -180 + frac*180;
  const r = 118, cx = 160, cy = 140;
  const rad = a => (a*Math.PI)/180;
  const px = (a,rr) => cx + rr*Math.cos(rad(a));
  const py = (a,rr) => cy + rr*Math.sin(rad(a));
  const arc = (a1,a2,rr,col,w) =>
    `<path d="M${px(a1,rr).toFixed(1)} ${py(a1,rr).toFixed(1)} A${rr} ${rr} 0 ${a2-a1>180?1:0} 1 ${px(a2,rr).toFixed(1)} ${py(a2,rr).toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const aVerify = -180 + (RULES.WALKIN_VERIFY/max)*180;
  const aCtr = -180 + (RULES.CTR_CASH/max)*180;
  return `
  <svg viewBox="0 0 320 176" xmlns="http://www.w3.org/2000/svg">
    ${arc(-180,-0.01,r,'#DCE6EF',13)}
    ${cash ? arc(-180,aVerify,r,'#0FA98A',13) + arc(aVerify,aCtr,r,'#E39A0C',13) + arc(aCtr,-0.01,r,'#E2493C',13)
           : arc(-180,-0.01,r,'#3B7DE8',13)}
    <g font-family="IBM Plex Mono, monospace" font-size="8.5" fill="#6B7F92">
      <text x="18" y="164">0</text>
      <text x="${(px(aVerify,r)-16).toFixed(1)}" y="${(py(aVerify,r)-14).toFixed(1)}">500K</text>
      <text x="${(px(aCtr,r)-8).toFixed(1)}" y="${(py(aCtr,r)-14).toFixed(1)}">2M</text>
      <text x="282" y="164">3M+</text>
    </g>
    <g transform="rotate(${ang.toFixed(2)} ${cx} ${cy})">
      <path d="M${cx} ${cy} L${cx+r-16} ${cy-4} L${cx+r-16} ${cy+4} Z" fill="#10202F"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="9" fill="#10202F" stroke="#FFFFFF" stroke-width="2"/>
    <text x="${cx}" y="${cy-30}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="23" font-weight="600" fill="#10202F">${PKR(amount)}</text>
    <text x="${cx}" y="${cy-13}" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" font-size="10.5" fill="#6B7F92">${cash?t('cashCaps','CASH'):t('nonCash','NON-CASH TRANSFER')}</text>
  </svg>`;
}

/* ---- certificate seal ---- */
function sealSVG(){
  const rays = [];
  for (let i=0;i<28;i++){
    const a = (i/28)*Math.PI*2;
    rays.push(`<line x1="${(52+38*Math.cos(a)).toFixed(1)}" y1="${(52+38*Math.sin(a)).toFixed(1)}" x2="${(52+45*Math.cos(a)).toFixed(1)}" y2="${(52+45*Math.sin(a)).toFixed(1)}" stroke="#C9962C" stroke-width="2" opacity=".55"/>`);
  }
  return `
  <svg viewBox="0 0 104 104" xmlns="http://www.w3.org/2000/svg">
    ${rays.join('')}
    <circle cx="52" cy="52" r="36" fill="rgba(201,150,44,.10)" stroke="#C9962C" stroke-width="2"/>
    <circle cx="52" cy="52" r="29" fill="none" stroke="#C9962C" stroke-width="1" opacity=".6"/>
    <path d="M52 32l3.6 7.6 8.3 1.1-6.1 5.8 1.5 8.3L52 50.9l-7.3 3.9 1.5-8.3-6.1-5.8 8.3-1.1z" fill="#C9962C"/>
    <text x="52" y="70" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="1.4" fill="#C9962C">SENTINEL</text>
  </svg>`;
}

/* ---- achievement badges ---- */
function badgeArt(kind){
  return `<img src="${assetUrl('badge-' + kind + '.png')}" alt="" width="64" height="64">`;
}

/* ---- small line icons ---- */
const ICONS = {
  dialogue:'<path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M9 11h6M9 15h4"/>',
  radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12l7-4"/><circle cx="16" cy="8" r="1.4" fill="currentColor"/>',
  console:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M7 17h3"/>',
  gauge:'<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4.5-5.5"/><circle cx="12" cy="18" r="1.6" fill="currentColor"/>',
  vault:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 6v2M12 16v2M6 12h2M16 12h2"/>',
  arrow:'<path d="M5 12h13M13 6l6 6-6 6"/>',
  back:'<path d="M19 12H6M11 6l-6 6 6 6"/>',
  sound:'<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute:'<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>'
};
const icon = (k, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w||1.7}" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

/* ---- ambient background canvas ---- */
function startAmbient(){
  const cv = byId('fx');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const gen = ++_ambientGen;
  let w, h, dots = [], glyphs = [];
  const SYM = ['\u20A8','$','\u20AC','\u00A3','\u00A5'];
  function size(){
    const box = rootEl();
    w = cv.width = Math.max(1, box.clientWidth || innerWidth);
    h = cv.height = Math.max(1, box.clientHeight || innerHeight);
  }
  function build(){
    dots = [];
    const n = Math.min(70, Math.round(w*h/26000));
    for (let i=0;i<n;i++) dots.push({x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.5+.4, vy:-(Math.random()*.14+.03), a:Math.random()*.4+.1});
    glyphs = [];
    for (let i=0;i<9;i++) glyphs.push({x:Math.random()*w, y:Math.random()*h, s:Math.random()*16+13, vy:-(Math.random()*.2+.07), a:Math.random()*.05+.02, c:SYM[i%SYM.length]});
  }
  function frame(){
    if (!_ambientRunning || gen !== _ambientGen) return;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#3B7DE8';
    dots.forEach(d=>{
      d.y += d.vy; if (d.y < -6){ d.y = h+6; d.x = Math.random()*w; }
      ctx.globalAlpha = d.a; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,7); ctx.fill();
    });
    glyphs.forEach(g=>{
      g.y += g.vy; if (g.y < -40){ g.y = h+40; g.x = Math.random()*w; }
      ctx.globalAlpha = g.a * 2.2; ctx.font = g.s+'px IBM Plex Mono, monospace'; ctx.fillStyle = '#8B5CF6';
      ctx.fillText(g.c, g.x, g.y);
    });
    ctx.globalAlpha = 1;
    _ambientRaf = requestAnimationFrame(frame);
  }
  _onResize = ()=>{ size(); build(); };
  addEventListener('resize', _onResize);
  _ambientRunning = true;
  size(); build(); frame();
}

/* ---- confetti burst ---- */
function confetti(){
  const cv = byId('confetti');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const box = rootEl();
  const W = Math.max(1, box.clientWidth || innerWidth);
  const H = Math.max(1, box.clientHeight || innerHeight);
  cv.width = W; cv.height = H;
  const cols = ['#0FA98A','#3B7DE8','#8B5CF6','#E39A0C','#C084FC','#34E0C0'];
  const ps = [];
  for (let i=0;i<130;i++) ps.push({
    x: W/2 + (Math.random()-.5)*260, y: H*0.34,
    vx:(Math.random()-.5)*11, vy:Math.random()*-13-3,
    w:Math.random()*7+3, h:Math.random()*4+2,
    r:Math.random()*6, vr:(Math.random()-.5)*.35,
    c:cols[(Math.random()*cols.length)|0], life:1
  });
  let t = 0;
  (function run(){
    ctx.clearRect(0,0,cv.width,cv.height);
    t++;
    ps.forEach(p=>{
      p.vy += .34; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .0075;
      ctx.save(); ctx.globalAlpha = Math.max(0,p.life);
      ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    });
    if (t < 210) requestAnimationFrame(run); else ctx.clearRect(0,0,cv.width,cv.height);
  })();
}

/* =====================================================================
   ENGINE — state, ranks, routing, sound, toasts
   ===================================================================== */
const RANKS = [
  {n:'Trainee',                     min:0,    stars:1},
  {n:'KYC Analyst',                 min:150,  stars:2},
  {n:'AML Analyst',                 min:400,  stars:3},
  {n:'Senior Compliance Analyst',   min:750,  stars:4},
  {n:'Compliance Officer',          min:1150, stars:5}
];
const BADGES = [
  {id:'onboarding', n:'Clean Onboarding', d:'Complete the CDD onboarding simulation with no critical breach.'},
  {id:'radar',      n:'Pattern Eye',      d:'Score 80% or higher on Red-Flag Radar.'},
  {id:'console',    n:'Case Closed',      d:'Score 80% or higher in the Review Console.'},
  {id:'thresholds', n:'Threshold Master', d:'Score 80% or higher on the Threshold Trainer.'},
  {id:'vault',      n:'Archivist',        d:'Open every card in the Reference Vault.'},
  {id:'clean',      n:'No Tip-Offs',      d:'Finish the onboarding simulation without ever tipping off the customer.'}
];

const MISSIONS = [
  {id:'onboarding', k:'Module 01', n:'Customer Onboarding', icon:'dialogue', c:'#3B7DE8',
   d:'A walk-in wants a company account opened today. Work the five CDD steps, spot the beneficial owner, and hold the line when he pushes.',
   meta:'Branching dialogue \u00b7 ~8 decisions'},
  {id:'radar', k:'Module 02', n:'Red-Flag Radar', icon:'radar', c:'#E39A0C', hidden:true,
   d:'Timed pattern recognition. Each observation belongs to one Annexure-II red-flag family — sort it before the clock runs out.',
   meta:'Timed arcade \u00b7 10 rounds'},
  {id:'console', k:'Module 03', n:'Review Console', icon:'console', c:'#0FA98A',
   d:'The capstone. Nine live transactions: clear, flag or escalate — and justify the call by naming the indicator you acted on.',
   meta:'Case queue \u00b7 9 transactions'},
  {id:'thresholds', k:'Module 04', n:'Threshold Trainer', icon:'gauge', c:'#8B5CF6',
   d:'Rapid fire on the numbers that never move: CTR at 2 million, walk-in verification at 500,000, STR at any amount at all.',
   meta:'Rule drill \u00b7 12 rounds'},
  {id:'vault', k:'Reference', n:'Reference Vault', icon:'vault', c:'#C9962C',
   d:'Every definition and threshold behind the four modules, in flip-card form. Free to browse — no scoring, no timer.',
   meta:'12 cards \u00b7 untimed'}
];

const KEY = 'sentinel_aml_v1';
let S = {xp:0, best:{}, badges:[], seen:[], muted:false, seenIntro:false, lang:'en'};
let host = null;
let _onComplete = null;
let _completedFired = false;
let _alive = false;
let _ambientRunning = false;
let _ambientRaf = 0;
let _onResize = null;
let _pointerDown = null;
let _ambientGen = 0;

function rootEl(){
  return host || document.querySelector('.aml-urdu-root') || document.body;
}

function byId(id){
  const root = rootEl();
  return (root && root.querySelector && root.querySelector('#' + id)) || document.getElementById(id);
}

function maybeComplete(){
  if (_completedFired || !_onComplete) return;
  const scored = MISSIONS.filter(m=>m.id!=='vault' && !m.hidden);
  const done = scored.filter(m=>S.best[m.id]!=null).length;
  if (done !== scored.length) return;
  const avg = Math.round(scored.reduce((a,m)=>a+S.best[m.id],0)/scored.length);
  _completedFired = true;
  _onComplete({
    score: avg,
    completed: true,
    metadata: { xp: S.xp, badges: [...S.badges], best: { ...S.best } }
  });
}

function isUr(){ return S.lang === 'ur'; }
function UR(){ return window.SENTINEL_UR || {}; }
function t(key, en){
  const ui = UR().ui;
  if (isUr() && ui && ui[key] != null && typeof ui[key] !== 'function') return ui[key];
  return en;
}
function tf(key, en, a, b){
  const ui = UR().ui;
  if (isUr() && ui && typeof ui[key] === 'function') return ui[key](a, b);
  return typeof en === 'function' ? en(a, b) : en;
}
function lu(obj, key){
  return isUr() && obj && obj[key+'Ur'] != null ? obj[key+'Ur'] : (obj ? obj[key] : '');
}
function cddStep(i){
  const steps = isUr() && UR().cddSteps ? UR().cddSteps : CDD_STEPS;
  return steps[i];
}
function locType(map, en){
  if (isUr() && map && map[en]) return map[en];
  return en;
}
function speakerElena(){ return (isUr() && UR().ui && UR().ui.names) ? UR().ui.names.elena : 'Elena Vance'; }
function speakerMarcus(){ return (isUr() && UR().ui && UR().ui.names) ? UR().ui.names.marcus : 'Marcus Hale'; }
function speakerElenaRole(){ return (isUr() && UR().ui && UR().ui.names) ? UR().ui.names.elenaRole : 'Elena Vance \u00b7 Head of Financial Crime Compliance'; }
function speakerMarcusRole(){ return (isUr() && UR().ui && UR().ui.names) ? UR().ui.names.marcusRole : 'Marcus Hale \u00b7 Senior AML Analyst'; }
function reasonLabel(c, en){
  if (!isUr()) return en;
  const ix = (c.reasons||[]).indexOf(en);
  if (ix >= 0 && c.reasonsUr && c.reasonsUr[ix]) return c.reasonsUr[ix];
  const dix = (c.decoys||[]).indexOf(en);
  if (dix >= 0 && c.decoysUr && c.decoysUr[dix]) return c.decoysUr[dix];
  return en;
}
function vf(file){
  if (!file) return file;
  return isUr() ? 'ur/' + file : file;
}

(function hydrateUrdu(){
  const U = UR();
  if (!U.dialogue) return;
  const fill = (enArr, urArr)=>{
    if (!enArr || !urArr) return;
    enArr.forEach((b,i)=>{
      const u = urArr[i]; if (!u) return;
      b.sayUr = u.say;
      if (u.sys) b.sysUr = u.sys;
      if (u.note) b.noteUr = u.note;
      (u.choices||[]).forEach((uc,j)=>{
        if (b.choices && b.choices[j]){ b.choices[j].tUr = uc.t; b.choices[j].fUr = uc.f; }
      });
    });
  };
  DIALOGUE.introUr = U.dialogue.intro;
  DIALOGUE.persona.roleUr = U.dialogue.personaRole;
  fill(DIALOGUE.beats, U.dialogue.beats);
  fill(DIALOGUE.edd, U.dialogue.edd);
  fill(DIALOGUE.standard, U.dialogue.standard);
  (U.flags||[]).forEach((txt,i)=>{ if (FLAGS[i]) FLAGS[i].tUr = txt; });
  Object.keys(U.cats||{}).forEach(k=>{ if (CATS[k]) CATS[k].nameUr = U.cats[k]; });
  (U.glossary||[]).forEach((u,i)=>{ if (GLOSSARY[i]){ GLOSSARY[i].tUr = u.t; GLOSSARY[i].dUr = u.d; }});
  (U.badges||[]).forEach((u,i)=>{ if (BADGES[i]){ BADGES[i].nUr = u.n; BADGES[i].dUr = u.d; }});
  (U.ranks||[]).forEach((u,i)=>{ if (RANKS[i]) RANKS[i].nUr = u.n; });
  (U.missions||[]).forEach((u,i)=>{ if (MISSIONS[i]){ MISSIONS[i].nUr = u.n; MISSIONS[i].dUr = u.d; MISSIONS[i].metaUr = u.meta; }});
  Object.keys(U.customers||{}).forEach(k=>{
    const u = U.customers[k], c = CUSTOMERS[k];
    if (!c || !u) return;
    c.businessUr = u.business; c.typeUr = u.type; c.turnoverUr = u.turnover;
  });
  (U.cases||[]).forEach((u,i)=>{
    const c = CASES[i]; if (!c || !u) return;
    c.narrativeUr = u.narrative; c.whyUr = u.why;
    if (u.details) c.detailsUr = u.details;
    if (u.reasons) c.reasonsUr = u.reasons;
    if (u.decoys) c.decoysUr = u.decoys;
  });
  Object.keys(U.actions||{}).forEach(k=>{
    if (ACTION_LABELS[k]){ ACTION_LABELS[k].nUr = U.actions[k].n; ACTION_LABELS[k].dUr = U.actions[k].d; }
  });
  (U.ttOptions||[]).forEach((u,i)=>{
    if (TT_OPTIONS[i]){ TT_OPTIONS[i].nUr = u.n; TT_OPTIONS[i].dUr = u.d; }
  });
  /* TT_NOTE is declared later in this module. Overlay it from boot() once it exists. */
})();

function hydrateTtNote(){
  const U = UR();
  if (!U.ttNote) return;
  Object.keys(U.ttNote).forEach(k=>{
    if (TT_NOTE[k]) TT_NOTE[k+'Ur'] = U.ttNote[k];
  });
}

function applyLang(){
  const ur = isUr();
  const root = rootEl();
  root.classList.toggle('lang-ur', ur);
  root.setAttribute('dir', ur ? 'rtl' : 'ltr');
  root.setAttribute('lang', ur ? 'ur' : 'en');
  const sub = document.querySelector('.brand-txt .t');
  if (sub) sub.textContent = t('academySub', 'AML / KYC Academy');
  const lb = byId('langbtn');
  if (lb){
    lb.textContent = ur ? 'EN' : 'اردو';
    lb.title = ur ? t('langToEn','Switch to English') : t('langToUr','اردو');
    lb.setAttribute('aria-label', ur ? 'Switch to English' : 'اردو موڈ');
  }
  const rb = byId('resetbtn');
  if (rb) rb.title = t('resetTitle','Reset progress');
  const splashEyebrow = document.querySelector('.splash-eyebrow');
  if (splashEyebrow) splashEyebrow.textContent = t('splashEyebrow', 'SBP AML/CFT · Training simulation');
  const splashSub = document.querySelector('.splash-sub');
  if (splashSub) splashSub.textContent = t('splashSub', 'AML / KYC Academy');
  const splashSkip = document.querySelector('.splash-skip');
  if (splashSkip) splashSkip.textContent = t('skipSplash', 'Click or tap to skip');
  const splashStatus = byId('splashstatus');
  if (splashStatus && splashStatus.textContent) splashStatus.textContent = t('loading', 'Loading academy…');
  const splashLangLbl = byId('splashlanglbl');
  if (splashLangLbl) splashLangLbl.textContent = t('chooseLang', 'Choose language');
  document.querySelectorAll('.splash-langbtn').forEach(b=>{
    const on = b.dataset.lang === (ur ? 'ur' : 'en');
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  renderSoundBtn();
  renderRank();
}

function setLang(lang, fromSplash){
  S.lang = lang === 'ur' ? 'ur' : 'en';
  save();
  applyLang();
  if (fromSplash) return;
  stopVoice();
  const skip = document.querySelector('.skipbtn');
  if (skip) skip.click();
  else if (!byId('splash')) home();
}

function load(){
  try{ const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); }catch(e){}
  if (S.lang !== 'ur') S.lang = 'en';
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){}
}
function rankOf(xp){
  let r = RANKS[0];
  RANKS.forEach(x=>{ if (xp >= x.min) r = x; });
  return r;
}
function nextRank(xp){ return RANKS.find(x=>x.min > xp) || null; }

function awardXP(n, label){
  const before = rankOf(S.xp);
  S.xp += n; save(); renderRank();
  const after = rankOf(S.xp);
  if (after.n !== before.n){
    confetti(); beep('rank');
    toast(t('promoted','Promoted to ') + lu(after,'n'), t('rankUp','Rank up — ') + after.stars + ' ' + (after.stars>1?t('stars','stars'):t('star','star')) + '. ' + S.xp + ' XP ' + t('xp','total.'));
  } else if (label){
    toast('+' + n + ' XP', label);
  }
}
function awardBadge(id){
  if (S.badges.includes(id)) return;
  S.badges.push(id); save();
  const b = BADGES.find(x=>x.id===id);
  beep('good');
  toast(t('badgeUnlocked','Badge unlocked — ') + lu(b,'n'), lu(b,'d'));
}

/* ---- sound (WebAudio beeps + MP3 voice) ---- */
let AC = null;
let _voice = null;
let _voiceFile = null;
let _onVoiceEnded = null;

function killVoiceEl(){
  if (!_voice) return;
  _voice.onended = null;
  _voice.onerror = null;
  try { _voice.pause(); _voice.src = ''; } catch(e){}
  _voice = null;
}
function stopVoice(clearFile){
  killVoiceEl();
  if (clearFile !== false){
    _voiceFile = null;
    _onVoiceEnded = null;
  }
}
function startVoiceEl(file){
  const a = new Audio(assetUrl('voice/' + vf(file)));
  _voice = a;
  attachVoiceEvents(a);
  const p = a.play();
  if (p && p.catch) p.catch(()=>{ if (_onVoiceEnded) _onVoiceEnded(); });
  return a;
}
function attachVoiceEvents(audio){
  if (!audio) return;
  audio.onended = ()=>{ if (_onVoiceEnded) _onVoiceEnded(); };
  audio.onerror = ()=>{ if (_onVoiceEnded) _onVoiceEnded(); };
}
function playVoice(file){
  killVoiceEl();
  _voiceFile = file || null;
  if (!file || S.muted) return null;
  return startVoiceEl(file);
}
function muteVoice(){
  if (_voice && !_voice.paused){
    try { _voice.pause(); } catch(e){}
  }
}
function unmuteVoice(){
  if (S.muted || !_voiceFile) return null;
  if (_voice && !_voice.ended){
    const p = _voice.play();
    if (p && p.catch) p.catch(()=>{});
    return _voice;
  }
  killVoiceEl();
  return startVoiceEl(_voiceFile);
}
function beep(kind){
  if (S.muted) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const seq = {
      good:[[660,0],[880,.08]], bad:[[220,0],[165,.1]], tick:[[520,0]],
      pick:[[440,0]], rank:[[523,0],[659,.09],[784,.18],[1047,.27]], done:[[587,0],[784,.11]]
    }[kind] || [[440,0]];
    seq.forEach(([f,d])=>{
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = kind==='bad' ? 'sawtooth' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, AC.currentTime+d);
      g.gain.linearRampToValueAtTime(.055, AC.currentTime+d+.012);
      g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime+d+.2);
      o.connect(g); g.connect(AC.destination);
      o.start(AC.currentTime+d); o.stop(AC.currentTime+d+.22);
    });
  }catch(e){}
}

/* ---- toasts ---- */
function toast(title, desc){
  const w = byId('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="tt">${title}</span>${desc?`<span class="td">${desc}</span>`:''}`;
  w.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(), 320); }, 4200);
}

/* ---- top bar ---- */
function renderRank(){
  const r = rankOf(S.xp), nx = nextRank(S.xp);
  const span = nx ? (S.xp - r.min) / (nx.min - r.min) : 1;
  byId('rankchip').innerHTML =
    rankBadge(r.stars) +
    `<div><div class="rk">${lu(r,'n')}</div>
      <div class="xp">${S.xp} XP${nx?` \u00b7 ${nx.min - S.xp} ${t('to','to')} ${lu(nx,'n')}`:' \u00b7 ' + t('maxRank','max rank')}</div>
      <div class="xpbar"><i style="width:${(span*100).toFixed(1)}%"></i></div></div>`;
}
function renderSoundBtn(){
  const btn = byId('soundbtn');
  btn.innerHTML = icon(S.muted?'mute':'sound');
  btn.classList.toggle('muted', !!S.muted);
  btn.title = S.muted ? t('soundOff','Sound off — tap to enable voice') : t('soundOn','Sound on — tap to mute');
  btn.setAttribute('aria-pressed', S.muted ? 'false' : 'true');
  btn.setAttribute('aria-label', S.muted ? t('enableVoice','Enable voice') : t('muteVoice','Mute voice'));
}

/* ---- router ---- */
let stage;
let activeTimers = [];
let _nav = 0;
function clearTimers(){ activeTimers.forEach(t=>clearInterval(t)); activeTimers = []; }
function go(html){
  closeModal();
  stopVoice();
  clearTimers();
  _nav++;
  stage.innerHTML = `<div class="screen">${html}</div>`;
  const scroller = byId('app') || rootEl();
  if (scroller && scroller.scrollTo) scroller.scrollTo({top:0, behavior:'smooth'});
  else if (stage.scrollIntoView) stage.scrollIntoView({block:'start'});
  return stage.firstElementChild;
}
function closeModal(){
  const el = byId('cmodal');
  if (el) el.remove();
  rootEl().style.overflow = '';
}
function openModal(html){
  stopVoice();
  closeModal();
  rootEl().style.overflow = 'hidden';
  const wrap = document.createElement('div');
  wrap.id = 'cmodal';
  wrap.className = 'cmodal';
  wrap.innerHTML = `<div class="cmodal-card" role="dialog">${html}</div>`;
  rootEl().appendChild(wrap);
  requestAnimationFrame(()=>wrap.classList.add('in'));
  return wrap;
}
function missionHead(m, hud){
  return `<div class="mhead">
    <button class="back" id="backbtn">${icon('back')} ${t('academy','Academy')}</button>
    <div><div class="tag" style="color:${m.c}">${m.k}</div><h2>${lu(m,'n')}</h2></div>
    <div class="mhead-spacer"></div>
    ${hud||''}
  </div>`;
}
function bindBack(){
  const b = byId('backbtn');
  if (b) b.onclick = home;
}
function grade(pct){
  const g = UR().ui && UR().ui.grade;
  if (pct >= 90) return isUr() && g ? g.ex : {g:'Exemplary', b:'Decision quality at this level is what a supervisor signs off without a second review.'};
  if (pct >= 75) return isUr() && g ? g.co : {g:'Competent', b:'Solid working judgement. The misses are worth reading back through before you move on.'};
  if (pct >= 55) return isUr() && g ? g.de : {g:'Developing', b:'The core rules are landing but the edge cases are not. A second run through will pay off.'};
  return isUr() && g ? g.nr : {g:'Needs review', b:'Work back through the Reference Vault — the thresholds and red-flag families are what most of these turned on.'};
}
function shuffle(a){ const x = a.slice(); for (let i=x.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [x[i],x[j]]=[x[j],x[i]]; } return x; }

/* ---- keyboard shortcuts, rebound per screen ---- */
let keyHandler = null;
function setKeys(fn){
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = fn;
  if (fn) document.addEventListener('keydown', fn);
}
function numberKeys(getButtons){
  return e => {
    const n = parseInt(e.key, 10);
    if (!n) return;
    const b = getButtons()[n-1];
    if (b && !b.disabled){ b.click(); }
  };
}

/* =====================================================================
   CINEMATIC LAYER — background, actors, typed speech, staged choices
   ===================================================================== */
const ART = {
  'elena-explain': assetUrl('elena-explain.png'),
  'elena-concern': assetUrl('elena-concern.png'),
  'marcus-neutral': assetUrl('marcus-neutral.png'),
  'marcus-alarm': assetUrl('marcus-alarm.png'),
  'cust-trader': assetUrl('cust-trader.png'),
  'cust-elder': assetUrl('cust-elder.png'),
  'cust-student': assetUrl('cust-student.png'),
  'cust-pep': assetUrl('cust-pep.png'),
  'cust-ngo': assetUrl('cust-ngo.png'),
  'cust-foreign': assetUrl('cust-foreign.png'),
  'bg-skyline': assetUrl('bg-skyline.png'),
  'bg-branch': assetUrl('bg-branch.png'),
  'bg-opsfloor': assetUrl('bg-opsfloor.png'),
  'bg-boardroom': assetUrl('bg-boardroom.png'),
  'bg-hall': assetUrl('bg-hall.png')
};
const CUST_ART = ['cust-trader','cust-elder','cust-student','cust-pep','cust-ngo','cust-foreign'];
const custArt = seed => CUST_ART[Math.abs(seed|0) % CUST_ART.length];

/* ---- background ---- */
let _bgTop = false, _bgKey = null;
function setScene(key){
  const scrim = byId('cscrim');
  if (!key){
    _bgKey = null;
    byId('cbgA').classList.remove('in');
    byId('cbgB').classList.remove('in');
    scrim.style.opacity = 0;
    rootEl().classList.remove('scene');
    return;
  }
  rootEl().classList.add('scene');
  scrim.style.opacity = 1;
  if (key === _bgKey) return;
  _bgKey = key;
  const incoming = byId(_bgTop ? 'cbgA' : 'cbgB');
  const outgoing = byId(_bgTop ? 'cbgB' : 'cbgA');
  _bgTop = !_bgTop;
  incoming.src = ART[key];
  incoming.classList.add('in');
  outgoing.classList.remove('in');
}

/* ---- actors ---- */
const _actors = {};
function clearActors(){
  Object.keys(_actors).forEach(k=>_actors[k].exit());
}
function actor(artKey, side, opts){
  opts = opts || {};
  const id = opts.id || side;
  if (_actors[id]){ _actors[id].mood(artKey); return _actors[id]; }
  const el = document.createElement('img');
  el.className = 'actor ' + side;
  el.alt = '';
  el.src = ART[artKey];
  byId('actors').appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    el.classList.add('in');
    setTimeout(()=>el.classList.add('idle'), 500);
  }));
  const handle = {
    el,
    mood(nextKey){
      if (el.src.endsWith(ART[nextKey])) return;
      el.style.opacity = 0;
      setTimeout(()=>{ el.src = ART[nextKey]; el.style.opacity = 1; }, 200);
    },
    exit(){
      el.classList.remove('in','idle');
      setTimeout(()=>el.remove(), 450);
      delete _actors[id];
    }
  };
  _actors[id] = handle;
  return handle;
}

/* ---- typed speech ---- */
let _typing = null;
function say(name, text, opts){
  opts = opts || {};
  const host = opts.el || byId('bubbleslot');
  if (!host) return Promise.resolve();
  text = text == null ? '' : String(text);
  const speed = opts.speed == null ? 18 : opts.speed;
  return new Promise(resolve=>{
    const b = document.createElement('div');
    b.className = 'cbubble';
    b.innerHTML = (name ? `<span class="who">${name}</span>` : '') +
                  `<span class="body"></span><span class="caret"></span>`;
    if (opts.append) host.appendChild(b); else { host.innerHTML = ''; host.appendChild(b); }
    const body = b.querySelector('.body');
    const caret = b.querySelector('.caret');
    const chunks = isUr() ? (text.match(/(\s+|[^\s]+)/g) || [text]) : null;
    const n = chunks ? chunks.length : Math.max(1, text.length);
    let i = 0, settled = false, typed = false;
    let heard = !opts.voice || S.muted;
    let typeKick = null, voiceWatch = null;

    const maybeResolve = ()=>{
      if (settled || !typed || !heard) return;
      settled = true;
      _onVoiceEnded = null;
      if (typeKick){ clearTimeout(typeKick); typeKick = null; }
      if (voiceWatch){ clearTimeout(voiceWatch); voiceWatch = null; }
      b.onclick = null;
      resolve();
    };
    const clearType = ()=>{
      if (_typing){ clearInterval(_typing); _typing = null; }
      body.textContent = text;
      if (caret && caret.parentNode) caret.remove();
      typed = true;
    };
    const skip = ()=>{
      stopVoice(true);
      heard = true;
      clearType();
      maybeResolve();
    };

    _onVoiceEnded = ()=>{ heard = true; maybeResolve(); };
    const audio = playVoice(opts.voice);
    b.onclick = skip;

    const startTyping = ms => {
      if (typed || _typing) return;
      if (ms === 0){ clearType(); maybeResolve(); return; }
      const step = Math.max(10, Math.min(42, ms || speed));
      _typing = setInterval(()=>{
        if (!b.isConnected){ skip(); return; }
        i++;
        body.textContent = chunks ? chunks.slice(0, i).join('') : text.slice(0, i);
        if (i >= n){
          if (_typing){ clearInterval(_typing); _typing = null; }
          if (caret && caret.parentNode) caret.remove();
          typed = true;
          maybeResolve();
        }
      }, step);
    };
    if (audio){
      const kick = ()=>{
        const dur = (Number.isFinite(audio.duration) ? audio.duration : 0) * 1000;
        startTyping(dur > 0 ? dur / n : speed);
      };
      if (audio.readyState >= 1) kick();
      else audio.addEventListener('loadedmetadata', kick, {once:true});
      typeKick = setTimeout(()=>startTyping(speed), 280);
      voiceWatch = setTimeout(()=>{ heard = true; maybeResolve(); }, 18000);
    } else {
      startTyping(speed);
    }
  });
}

/* ---- staged choices ---- */
function choices(items, opts){
  opts = opts || {};
  const host = opts.el || byId('choiceslot');
  return new Promise(resolve=>{
    host.innerHTML =
      (opts.prompt === false ? '' : `<div class="cprompt">${opts.prompt || t('selectAnswer','Select The Most Effective Answer.')}</div>`) +
      `<div class="cchoices" id="crows">` +
      items.map((c,ix)=>`<button class="crow" data-i="${ix}">
        <span class="ic">${c.ic == null ? ix+1 : c.ic}</span><span>${c.t}</span></button>`).join('') +
      `</div>`;
    const rows = [...host.querySelectorAll('.crow')];
    rows.forEach((r,ix)=>setTimeout(()=>r.classList.add('shown'), 60*ix));
    setKeys(numberKeys(()=>rows));
    rows.forEach(r=>{ r.onclick = ()=>{ beep('pick'); resolve(parseInt(r.dataset.i,10)); }; });
  });
}

/* ---- module briefing ---- */
function brief(m, bgKey, artKey, name, lines){
  return new Promise(resolve=>{
    setKeys(null);
    clearActors();
    setScene(bgKey);
    actor(artKey, 'right', {id:'mentor'});
    go(`${missionHead(m,'')}
      <div style="max-width:min(100%,700px);padding:4vh 0 0">
        <div id="bubbleslot"></div>
        <div id="ctaslot" style="display:flex;justify-content:flex-start;width:100%;margin-top:22px"></div>
      </div>`);
    bindBack();
    const nav = _nav;
    (async ()=>{
      for (const line of lines){
        if (nav !== _nav) return;
        const text = typeof line === 'string' ? line : (isUr() && line.tUr ? line.tUr : line.t);
        const voice = typeof line === 'string' ? null : line.v;
        await say(name, text, {append:true, voice});
      }
      if (nav !== _nav) return;
      const slot = byId('ctaslot');
      if (!slot) return;
      slot.innerHTML =
        `<button class="cnext" id="startbtn" style="margin-left:0">${t('start','Start')} ${icon('arrow')}</button>`;
      const sb = byId('startbtn');
      sb.onclick = ()=>{ beep('pick'); resolve(); };
      setKeys(e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); sb.click(); } });
    })();
  });
}

/* ---- countdown ring ---- */
const RING_C = 2 * Math.PI * 34;
function ringHTML(id){
  return `<div class="ring" id="${id}">
    <svg viewBox="0 0 82 82">
      <circle class="trk" cx="41" cy="41" r="34"/>
      <circle class="prg" cx="41" cy="41" r="34"
        stroke-dasharray="${RING_C.toFixed(1)}" stroke-dashoffset="0"/>
    </svg>
    <div class="lbl">0:00</div>
  </div>`;
}
function ringSet(id, frac, secs){
  const w = byId(id);
  if (!w) return;
  frac = Math.max(0, Math.min(1, frac));
  w.querySelector('.prg').style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(1);
  const s = Math.max(0, Math.ceil(secs));
  w.querySelector('.lbl').textContent = Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
  w.classList.toggle('danger', frac <= 0.28);
}

/* =====================================================================
   HOME SCREEN
   ===================================================================== */
function home(){
  setKeys(null);
  const skip = document.querySelector('.skipbtn');
  if (skip){ skip.click(); return; }
  clearActors();
  setScene('bg-skyline');
  actor('elena-explain','right');
  const scored = MISSIONS.filter(m=>m.id!=='vault' && !m.hidden);
  const done = scored.filter(m=>S.best[m.id]!=null).length;
  const allDone = done === scored.length;
  const avg = allDone ? Math.round(scored.reduce((a,m)=>a+S.best[m.id],0)/scored.length) : 0;

  go(`
    <div class="home-top">
    <div class="hero" style="grid-template-columns:1fr">
      <div class="hero-l">
        <div class="eyebrow">${t('heroEyebrow','SBP AML/CFT \u00b7 Training simulation')}</div>
        <h1>${t('heroH1a','You are the last ')}<em>${t('heroH1em','control')}</em>${t('heroH1b',' before the money moves.')}</h1>
        <p>${t('heroP','Four modules built from Pakistan\u2019s AML/CFT regulations for banks and DFIs. Onboard a customer who does not want to be onboarded properly, learn the red-flag families by sight, work a live transaction queue, and drill the thresholds until they are reflex.')}</p>
        <div class="statrow">
          <div class="stat"><div class="v">${S.xp}</div><div class="l">${t('xp','Total XP')}</div></div>
          <div class="stat"><div class="v">${done}/${scored.length}</div><div class="l">${t('modules','Modules')}</div></div>
          <div class="stat"><div class="v">${S.badges.length}/${BADGES.length}</div><div class="l">${t('badges','Badges')}</div></div>
          <div class="stat"><div class="v">${allDone?avg+'%':'\u2014'}</div><div class="l">${t('average','Average')}</div></div>
        </div>
      </div>
    </div>
    <div class="achieve-box">
      <h2>${t('achievements','Achievements')}</h2>
      <div class="d">${tf('unlockedOf', S.badges.length + ' of ' + BADGES.length + ' unlocked.', S.badges.length, BADGES.length)}</div>
      <div class="badgerow">
        ${BADGES.map(b=>`
          <div class="badge ${S.badges.includes(b.id)?'earned':''}" title="${lu(b,'d')}">
            ${badgeArt(b.id)}<div class="bn">${lu(b,'n')}</div>
          </div>`).join('')}
      </div>
      ${allDone ? `<button class="btn primary" id="certbtn" style="margin-top:18px">${t('viewCredential','View credential')}</button>` : ''}
    </div>
    </div>

    <div class="sechead">
      <div>
        <div class="eyebrow">${t('curriculum','Curriculum')}</div>
        <h2>${t('trainingModules','Training modules')}</h2>
        <div class="d">${t('curriculumD','Each module maps to a section of the SBP content notes. Play in any order.')}</div>
      </div>
    </div>
    <div class="mgrid">
      ${MISSIONS.filter(m=>!m.hidden).map(m=>`
        <div class="mcard" data-m="${m.id}" style="--c:${m.c}">
          <div class="micon">${icon(m.icon)}</div>
          <div class="mk">${m.id==='vault' ? m.k : t('day','Day') + ' ' + (scored.findIndex(x=>x.id===m.id) + 1) + ' \u00b7 ' + m.k}</div>
          <h3>${lu(m,'n')}</h3>
          <p>${lu(m,'d')}</p>
          <div class="mfoot">
            <span class="mmeta">${lu(m,'meta')}</span>
            ${S.best[m.id]!=null
              ? `<span class="mbest">${t('best','Best')} ${S.best[m.id]}%</span>`
              : `<span class="play">${t('startPlay','Start')} ${icon('arrow')}</span>`}
          </div>
        </div>`).join('')}
    </div>
  `);

  stage.querySelectorAll('.mcard').forEach(el=>{
    el.onclick = ()=>{ beep('pick'); ({
      onboarding: missionOnboarding,
      radar: missionRadar,
      console: missionConsole,
      thresholds: missionThresholds,
      vault: screenVault
    })[el.dataset.m](); };
  });
  const cb = byId('certbtn');
  if (cb) cb.onclick = ()=>screenCertificate(avg);
}

/* =====================================================================
   RESULTS SCREEN (shared)
   ===================================================================== */
const pctIsGood = o => Math.round(o.pct) >= 70;
function results(o){
  setKeys(null);
  clearActors();
  setScene('bg-boardroom');
  actor(pctIsGood(o) ? 'elena-explain' : 'elena-concern', 'right', {id:'mentor'});
  const m = MISSIONS.find(x=>x.id===o.id);
  const pct = Math.round(o.pct);
  const g = grade(pct);
  const prevBest = S.best[o.id];
  const isBest = prevBest == null || pct > prevBest;
  if (isBest){ S.best[o.id] = pct; save(); }
  awardXP(o.xp, lu(m,'n') + ' ' + t('complete','complete'));
  beep('done');
  if (pct >= 80 && ['radar','console','thresholds'].includes(o.id)) awardBadge(o.id);

  go(`
    ${missionHead(m,'')}
    <div class="panel" style="max-width:min(100%,760px)">
      <div class="res">
        <div class="bigscore" style="color:${m.c}">${pct}%</div>
        <div class="grade">${g.g} \u00b7 ${o.headline}</div>
        <div class="blurb">${g.b}</div>
        <div class="xpgain">+${o.xp} XP${isBest?' \u00b7 ' + t('newBest','new personal best'):''}</div>
        ${o.breakdown && o.breakdown.length ? `<div class="brk">
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">${o.brkTitle||t('breakdown','Breakdown')}</div>
          ${o.breakdown.map(b=>`
            <div class="brk-row">
              <span class="bl">${b.label}</span>
              <span class="bb"><i style="width:${b.pct}%;background:${b.pct>=75?'var(--teal)':b.pct>=50?'var(--amber)':'var(--coral)'}"></i></span>
              <span class="bv">${b.val}</span>
            </div>`).join('')}
        </div>` : ''}
        ${o.extra || ''}
        <div class="res-actions">
          <button class="cnext" id="againbtn">${t('runAgain','Run it again')}</button>
          <button class="btn ghost" id="homebtn">${t('backAcademy','Back to academy')}</button>
        </div>
      </div>
    </div>
  `);
  bindBack();
  byId('againbtn').onclick = o.again;
  byId('homebtn').onclick = home;
  maybeComplete();
}

/* =====================================================================
   MODULE 01 — CUSTOMER ONBOARDING (branching CDD dialogue)
   ===================================================================== */
function missionOnboarding(){
  const m = MISSIONS.find(x=>x.id==='onboarding');
  const P = DIALOGUE.persona;
  let custA = null;
  let mentorA = null;
  let seq = DIALOGUE.beats.slice();
  let i = 0, pts = 0, max = 0, tipOffs = 0, criticals = 0, branch = null;
  let integrity = 100, rapport = 62;
  let log = [];
  const stepScores = {};

  function mood(){
    if (rapport < 35) return 'annoyed';
    if (rapport < 52) return 'tense';
    if (rapport > 78) return 'pleased';
    return 'neutral';
  }

  function draw(){
    const b = seq[i];
    const hud = `<div class="hudpill"><span class="lbl">${t('decision','Decision')}</span><b>${i+1}/${seq.length}</b></div>`;
    go(`
      ${missionHead(m, hud)}
      <div class="progline"><i style="width:${(i/seq.length*100).toFixed(1)}%"></i></div>
      <div class="cdd-steps">
        ${CDD_STEPS.map((s,ix)=>`<div class="cdd-step ${ix===b.step?'on':ix<b.step?'done':''}">${ix+1}. ${cddStep(ix)}</div>`).join('')}
      </div>
      <div class="panel" style="max-width:min(100%,760px);margin-left:auto">
        <div class="hud-row">
          <div>
            <div style="font-size:15px;font-weight:600;color:var(--ink)">${P.name}</div>
            <div style="font-size:12px;color:var(--muted)">${lu(P,'role')}</div>
          </div>
          <div style="flex:1"></div>
          <div class="meter" style="width:150px;margin:0">
            <div class="mrow"><span>${t('fileIntegrity','File integrity')}</span><span style="color:${integrity>=80?'var(--teal)':integrity>=50?'var(--amber)':'var(--coral)'}">${integrity}%</span></div>
            <div class="bar"><i style="width:${integrity}%;background:${integrity>=80?'var(--teal)':integrity>=50?'var(--amber)':'var(--coral)'}"></i></div>
          </div>
          <div class="meter" style="width:150px;margin:0">
            <div class="mrow"><span>${t('rapport','Rapport')}</span><span style="color:var(--blue)">${rapport}%</span></div>
            <div class="bar"><i style="width:${rapport}%;background:var(--blue)"></i></div>
          </div>
        </div>
        ${b.sys ? `<div class="bubble sys"><span class="who">${t('elevenDays','Eleven days later')}</span>${lu(b,'sys')}</div>` : ''}
        ${i===0 ? `<div class="bubble sys"><span class="who">${t('branchFloor','Branch floor')}</span>${lu(DIALOGUE,'intro')}</div>` : ''}
        <div id="bubbleslot"></div>
        ${b.note ? `<div class="narr" style="margin:14px 0 0"><b style="color:var(--amber);font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:6px">${t('onTheFile','On the file')}</b>${lu(b,'note')}</div>` : ''}
        <div id="choiceslot" style="margin-top:18px"></div>
        <div id="fbslot"></div>
      </div>
    `);
    bindBack();
    if (custA) custA.mood('cust-foreign');
    const nav = _nav;
    (async ()=>{
      await say(P.name, lu(b,'say'), {voice:b.voice});
      if (nav !== _nav) return;
      const ix = await choices(b.choices.map(c=>({t:lu(c,'t')})));
      if (nav !== _nav) return;
      const btn = document.querySelector(`#crows .crow[data-i="${ix}"]`);
      answer(ix, btn);
    })();
  }

  function answer(ix, btn){
    const b = seq[i], c = b.choices[ix];
    const gain = c.v==='good' ? 2 : c.v==='meh' ? 1 : 0;
    pts += gain; max += 2;
    stepScores[CDD_STEPS[b.step]] = stepScores[CDD_STEPS[b.step]] || {p:0,m:0};
    stepScores[CDD_STEPS[b.step]].p += gain;
    stepScores[CDD_STEPS[b.step]].m += 2;

    if (c.v === 'good'){ integrity = Math.min(100, integrity + 2); rapport = Math.max(0, rapport - 4); beep('good'); }
    else if (c.v === 'meh'){ integrity = Math.max(0, integrity - 7); rapport += 3; beep('pick'); }
    else { integrity = Math.max(0, integrity - 18); rapport += 8; criticals++; beep('bad'); }
    rapport = Math.max(0, Math.min(100, rapport));
    if (c.v === 'bad' && /tipping off/i.test(c.cite)) tipOffs++;

    document.querySelectorAll('#crows .crow').forEach(el=>{
      el.disabled = true;
      el.onclick = null;
      if (el !== btn) el.classList.add('faded');
    });
    btn.classList.add(c.v);
    mentorA = actor(c.v === 'good' ? 'elena-explain' : 'elena-concern', 'right', {id:'mentor'});

    if (c.branch && !branch){ branch = c.branch; seq = seq.concat(DIALOGUE[branch]); }

    openModal(`
      <div class="verdict ${c.v}">
        <span class="vt">${c.v==='good'?t('correctHandling','Correct handling'):c.v==='meh'?t('partial','Partially correct'):t('breach','Regulatory breach')}</span>
        ${lu(c,'f')}
        <span class="cite">${t('reference','Reference')} \u2014 ${c.cite}</span>
      </div>
      <div class="cmodal-foot">
        <button class="cnext" id="nextbtn">${i+1>=seq.length && branchResolved()?t('seeAssessment','See assessment'):t('next','Next')} ${icon('arrow')}</button>
      </div>`);

    const nb = byId('nextbtn');
    setKeys(e=>{ if (e.key==='Enter'||e.key===' ') { e.preventDefault(); nb.click(); } });
    nb.onclick = ()=>{ closeModal(); i++; if (i >= seq.length) finish(); else draw(); };
  }
  function branchResolved(){ return branch != null; }

  function finish(){
    clearActors();
    const pct = (pts/max)*100;
    if (criticals === 0) awardBadge('onboarding');
    if (tipOffs === 0) awardBadge('clean');
    const xp = Math.round(pts * 9);
    const brk = Object.keys(stepScores).map(k=>({
      label:t('step','Step') + ' \u2014 ' + cddStep(CDD_STEPS.indexOf(k)),
      pct:Math.round(stepScores[k].p/stepScores[k].m*100),
      val:stepScores[k].p + '/' + stepScores[k].m
    }));
    results({
      id:'onboarding', pct, xp, breakdown:brk, brkTitle:t('byCddStep','By CDD step'),
      headline: pts + '/' + max + ' ' + t('decisionPoints','decision points'),
      extra:`<div style="max-width:520px;margin:24px auto 0;text-align:left">
        <div class="drow"><span class="k">${t('pathTaken','Path taken at risk assessment')}</span><span class="v" style="color:${branch==='edd'?'var(--teal)':'var(--coral)'}">${branch==='edd'?t('pathEdd','Enhanced due diligence'):t('pathStd','Standard CDD \u2014 escalated back later')}</span></div>
        <div class="drow"><span class="k">${t('tipOffs','Tipping-off breaches')}</span><span class="v" style="color:${tipOffs?'var(--coral)':'var(--teal)'}">${tipOffs}</span></div>
        <div class="drow"><span class="k">${t('finalIntegrity','Final file integrity')}</span><span class="v">${integrity}%</span></div>
      </div>`,
      again: missionOnboarding
    });
  }

  brief(m, 'bg-branch', 'elena-explain', speakerElena(), [
    {t:'There is a new customer waiting at the counter. Your job is customer due diligence: identify them, verify the identity against a reliable source, establish who really owns the business, and then decide how much scrutiny this file needs.', tUr:'کاؤنٹر پر ایک نیا کسٹمر انتظار کر رہا ہے۔ آپ کا کام کسٹمر ڈیو ڈیلیجنس ہے: ان کی شناخت کریں، شناخت کا کسی قابلِ اعتماد ذریعے سے ویریفائی کریں، یہ طے کریں کہ کاروبار کا اصل مالک کون ہے، اور پھر فیصلہ کریں کہ اس فائل پر کتنی جانچ چاہیے۔', v:'03-onboard-brief-elena-1.mp3'},
    {t:'The customer will be helpful right up to the moment you ask something inconvenient. Remember that rapport is not what the file is judged on.', tUr:'کسٹمر اس لمحے تک مددگار رہے گا جب تک آپ کچھ ناگوار نہ پوچھیں۔ یاد رکھیں — فائل پر فیصلہ رپورٹ سے ہوتا ہے، دوستانہ رویے سے نہیں۔', v:'04-onboard-brief-elena-2.mp3'}
  ]).then(()=>{
    clearActors();
    setScene('bg-branch');
    custA = actor('cust-foreign', 'left', {id:'cust'});
    draw();
  });
}

/* =====================================================================
   MODULE 02 — RED-FLAG RADAR (timed category sorting)
   ===================================================================== */
function missionRadar(){
  const m = MISSIONS.find(x=>x.id==='radar');
  const ROUNDS = 10, LIMIT = 18;
  const deck = shuffle(FLAGS).slice(0, ROUNDS);
  const catKeys = Object.keys(CATS);
  let i = 0, correct = 0, combo = 0, bestCombo = 0, points = 0;
  const perCat = {}; catKeys.forEach(k=>perCat[k] = {c:0,t:0});
  let marcusA = null;

  function draw(){
    const f = deck[i];
    let left = LIMIT, locked = false;
    go(`
      ${missionHead(m, `
        <div class="hudpill"><span class="lbl">${t('round','Round')}</span><b>${i+1}/${ROUNDS}</b></div>
        <div class="hudpill"><span class="lbl">${t('hits','Hits')}</span><b style="color:var(--teal)">${correct}</b></div>
        <div class="hudpill"><span class="lbl">${t('combo','Combo')}</span><b class="combo" id="combo">\u00d7${combo||1}</b></div>`)}
      <div class="panel" style="max-width:min(100%,780px);margin-left:auto">
        <div class="hud-row">
          ${ringHTML('tring')}
          <div class="flagcard" style="flex:1;margin:0">
            <div class="obs">${t('observation','Observation')} ${String(i+1).padStart(2,'0')}</div>
            <div class="txt">${lu(f,'t')}</div>
          </div>
        </div>
        <div id="choiceslot"></div>
        <div id="fbslot"></div>
      </div>
    `);
    bindBack();
    ringSet('tring', 1, LIMIT);
    choices(catKeys.map((k,ix)=>({t:lu(CATS[k],'name'), ic:k})), {prompt:t('whichFamily','Which red-flag family is this?')})
      .then(ix=>{ const k = catKeys[ix]; pick(k, document.querySelector(`#crows .crow[data-i="${ix}"]`)); });

    const t = setInterval(()=>{
      left -= 0.1;
      ringSet('tring', left/LIMIT, left);
      if (left <= 0){ clearInterval(t); if (!locked) pick(null); }
    }, 100);
    activeTimers.push(t);

    function pick(k, btn){
      if (locked) return;
      locked = true; clearInterval(t);
      const ok = k === f.c;
      perCat[f.c].t++;
      if (ok){
        perCat[f.c].c++; correct++; combo++; bestCombo = Math.max(bestCombo, combo);
        points += 10 + Math.min(15, (combo-1)*3) + Math.round(left/2);
        beep('good');
      } else { combo = 0; beep('bad'); }

      document.querySelectorAll('#crows .crow').forEach((el,ix)=>{
        el.disabled = true;
        el.onclick = null;
        if (catKeys[ix] === f.c) el.classList.add('good');
        else if (el === btn) el.classList.add('bad');
        else el.classList.add('faded');
      });
      if (marcusA) marcusA.mood(ok ? 'marcus-neutral' : 'marcus-alarm');

      byId('fbslot').innerHTML = `
        <div class="verdict ${ok?'good':'bad'}">
          <span class="vt">${ok?t('correctFamily','Correct family'):k===null?t('timeExpired','Time expired'):t('wrongFamily','Wrong family')}</span>
          ${t('belongsTo','This belongs to')} <b style="color:${CATS[f.c].color}">${f.c} \u2014 ${lu(CATS[f.c],'name')}</b>.
          ${ok ? t('familyOk','Sorting by family is what lets you reach for the right follow-up question instead of a generic one.')
               : t('familyBad','Read it again against the family definition \u2014 the giveaway is what the observation is really about, not the amount involved.')}
          <span class="cite">${t('reference','Reference')} \u2014 ${f.c}</span>
        </div>
        <div style="display:flex;margin-top:14px"><button class="cnext" id="nextbtn">${i+1>=ROUNDS?t('seeAssessment','See assessment'):t('nextObs','Next observation')} ${icon('arrow')}</button></div>`;
      const nb = byId('nextbtn');
      setKeys(e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); nb.click(); } });
      nb.onclick = ()=>{ i++; if (i>=ROUNDS) finish(); else draw(); };
    }
  }

  function finish(){
    clearActors();
    const pct = correct/ROUNDS*100;
    const brk = Object.keys(perCat).filter(k=>perCat[k].t>0).map(k=>({
      label:'Cat ' + k + ' \u2014 ' + lu(CATS[k],'name'),
      pct:Math.round(perCat[k].c/perCat[k].t*100),
      val:perCat[k].c + '/' + perCat[k].t
    }));
    results({
      id:'radar', pct, xp:points, breakdown:brk, brkTitle:t('byFamily','By red-flag family'),
      headline: correct + '/' + ROUNDS + ' ' + t('sortedCorrect','sorted correctly') + ' \u00b7 ' + t('bestCombo','best combo') + ' \u00d7' + Math.max(1,bestCombo),
      again: missionRadar
    });
  }

  brief(m, 'bg-opsfloor', 'marcus-neutral', speakerMarcus(), [
    {t:'Five red-flag families, A through E, straight out of Annexure-II. If you cannot name the family an observation belongs to, you cannot reach for the right follow-up question.', tUr:'پانچ ریڈ فلیگ فیملیز، اے سے ای، سیدھا اینیکسر ٹو سے۔ اگر آپ مشاہدے کی فیملی کا نام نہیں لے سکتے، تو درست فالو اپ سوال تک پہنچ ہی نہیں سکتے۔', v:'15-radar-brief-marcus-1.mp3'},
    {t:'Ten observations, eighteen seconds each. Answer fast and the combo multiplier stays alive.', tUr:'دس مشاہدے، ہر ایک اٹھارہ سیکنڈ۔ جلدی جواب دو تو کامبو ملٹیپلائر زندہ رہتا ہے۔', v:'16-radar-brief-marcus-2.mp3'}
  ]).then(()=>{
    clearActors();
    setScene('bg-opsfloor');
    marcusA = actor('marcus-neutral','left',{id:'mentor'});
    draw();
  });
}

/* =====================================================================
   MODULE 03 — REVIEW CONSOLE (the capstone case queue)
   ===================================================================== */
function missionConsole(){
  const m = MISSIONS.find(x=>x.id==='console');
  let i = 0, correct = 0, justOK = 0, justTotal = 0, points = 0;
  const perCat = {};

  function draw(){
    const c = CASES[i];
    const cust = CUSTOMERS[c.cust];
    const isCash = /cash/i.test(c.type);
    let stage2 = null;   // pending action awaiting justification
    let picked = new Set();
    let locked = false;
    const chipList = c.reasons ? shuffle(c.reasons.concat(c.decoys||[])) : [];

    go(`
      ${missionHead(m, `
        <div class="hudpill"><span class="lbl">${t('case','Case')}</span><b>${i+1}/${CASES.length}</b></div>
        <div class="hudpill"><span class="lbl">${t('resolved','Resolved')}</span><b style="color:var(--teal)">${correct}</b></div>`)}
      <div class="progline"><i style="width:${(i/CASES.length*100).toFixed(1)}%"></i></div>
      <div class="con-wrap">
        <div class="panel dossier">
          <h4>${t('dossier','Customer dossier')}</h4>
          <div class="field"><div class="fl">${t('accountHolder','Account holder')}</div><div class="fv">${cust.name}</div></div>
          <div class="field"><div class="fl">${t('statedBusiness','Stated business')}</div><div class="fv">${lu(cust,'business')}</div></div>
          <div class="field"><div class="fl">${t('accountType','Account type')}</div><div class="fv">${lu(cust,'type')}</div></div>
          <div class="field"><div class="fl">${t('expectedTurnover','Expected turnover')}</div><div class="fv">${lu(cust,'turnover')}</div></div>
          <div class="field"><div class="fl">${t('since','Relationship since')}</div><div class="fv">${cust.since}</div></div>
          <div class="field"><div class="fl">${t('riskRating','Risk rating')}</div><div class="fv"><span class="risktag ${cust.risk}">${cust.risk==='low'?t('low','Low'):cust.risk==='med'?t('med','Medium'):t('high','High')}</span></div></div>
        </div>

        <div class="panel case-wrap" id="casecard">
          <div class="stamp" id="stamp">${t('cleared','Cleared')}</div>
          <div class="case-top">
            <span class="case-id">${c.id}</span>
            <span class="case-id">${t('queuePos','Queue position')} ${i+1} ${t('of','of')} ${CASES.length}</span>
          </div>
          <div class="amtrow">
            <div>
              <div class="amt"><span class="cur">PKR</span>${c.amount.toLocaleString('en-US')}</div>
              <div class="ttype">${locType(UR().caseTypes, c.type)}</div>
            </div>
          </div>
          <div class="thermo">${thermoSVG(c.amount, isCash)}</div>
          <div>${(isUr() && c.detailsUr ? c.detailsUr : c.details).map(d=>`<div class="drow"><span class="k">${d[0]}</span><span class="v">${d[1]}</span></div>`).join('')}</div>
          <div class="narr">${lu(c,'narrative')}</div>
          <div class="acts" id="acts">
            ${Object.keys(ACTION_LABELS).map(k=>`
              <button class="act" data-a="${k}"><span>${lu(ACTION_LABELS[k],'n')}</span><small>${lu(ACTION_LABELS[k],'d')}</small></button>`).join('')}
          </div>
        </div>
      </div>
      <div class="reasons" id="reasons">
        <div class="h">${t('whichIndicator','Which indicator are you acting on? Select every one that applies, then confirm.')}</div>
        <div id="chips">${chipList.map((r,ix)=>`<span class="chip" data-r="${ix}">${reasonLabel(c, r)}</span>`).join('')}</div>
        <button class="btn primary wide" id="confirm" style="margin-top:12px">${t('confirm','Confirm decision')}</button>
      </div>
      <div id="fbslot"></div>
    `);
    bindBack();

    const acts = byId('acts');
    acts.querySelectorAll('.act').forEach(b=>b.onclick = ()=>chooseAction(b.dataset.a, b));

    function chooseAction(a, btn){
      if (locked) return;
      if ((a === 'flag' || a === 'escalate') && c.reasons && !stage2){
        stage2 = a;
        acts.querySelectorAll('.act').forEach(el=>{ el.disabled = true; });
        btn.classList.add('picked');
        byId('reasons').classList.add('show');
        beep('pick');
        document.querySelectorAll('#chips .chip').forEach(ch=>{
          ch.onclick = ()=>{
            if (locked) return;
            const k = ch.dataset.r;
            if (picked.has(k)) picked.delete(k); else picked.add(k);
            ch.classList.toggle('on');
            beep('tick');
          };
        });
        byId('confirm').onclick = ()=>{
          if (!picked.size){ toast(t('selectIndicator','Select an indicator'), t('selectIndicatorD','A flag or escalation has to name the pattern it rests on.')); return; }
          resolve(stage2);
        };
        return;
      }
      resolve(a, btn);
    }

    function resolve(a){
      locked = true;
      const ok = a === c.correct;
      if (ok) correct++;
      perCat[c.category] = perCat[c.category] || {c:0,t:0};
      perCat[c.category].t++;
      if (ok) perCat[c.category].c++;

      // justification accuracy
      let jNote = '';
      let cleanJust = false;
      if (c.reasons){
        justTotal++;
        const correctSet = new Set(c.correctReasons.map(ix=>c.reasons[ix]));
        const chosen = [...picked].map(ix=>chipList[ix]);
        const hits = chosen.filter(x=>correctSet.has(x)).length;
        const falsePos = chosen.length - hits;
        const clean = hits === correctSet.size && falsePos === 0;
        if (clean){ justOK++; cleanJust = true; jNote = t('justComplete','Justification was complete and carried no decoys.'); }
        else if (hits && !falsePos) jNote = tf('justIncomplete', 'Justification was on the right track but incomplete \u2014 you named ' + hits + ' of ' + correctSet.size + ' applicable indicators.', hits, correctSet.size);
        else if (falsePos) jNote = tf('justFalse', 'Justification included ' + falsePos + ' indicator' + (falsePos>1?'s':'') + ' that does not apply to this case.', falsePos);
        else jNote = t('justNone','None of the selected indicators apply to this case.');

        document.querySelectorAll('#chips .chip').forEach(ch=>{
          const label = chipList[ch.dataset.r];
          if (correctSet.has(label)) ch.classList.add(ch.classList.contains('on') ? 'correct-r' : 'missed');
        });
      }

      points += (ok?18:0) + (c.reasons && cleanJust?7:0);

      acts.querySelectorAll('.act').forEach(el=>{ el.disabled = true; });
      const chosenBtn = acts.querySelector(`.act[data-a="${a}"]`);
      if (chosenBtn) chosenBtn.classList.add('picked');
      const cf = byId('confirm');
      if (cf) cf.disabled = true;

      const st = byId('stamp');
      st.textContent = ok ? t('correct','Correct') : t('rereview','Re-review');
      st.classList.add('show', ok?'good':'bad');
      beep(ok?'good':'bad');
      actor(ok ? 'elena-explain' : 'elena-concern', 'right', {id:'mentor'});

      const rs = byId('reasons');
      if (rs) rs.classList.remove('show');

      openModal(`
        <div class="verdict ${ok?'good':'bad'}">
          <span class="vt">${ok?t('correctDisp','Correct disposition'):t('incorrectDisp','Incorrect disposition')}</span>
          ${ok ? '' : `<b>${t('correctActionWas','The correct action was')} \u201c${lu(ACTION_LABELS[c.correct],'n')}\u201d.</b> `}${lu(c,'why')}
          ${jNote ? `<span style="display:block;margin-top:9px;color:var(--muted)">${jNote}</span>` : ''}
          <span class="cite">${t('reference','Reference')} \u2014 ${c.category==='baseline'?'Thresholds \u00a72':'Red-flag library \u00b7 ' + c.category.replace(/_/g,' ')}</span>
        </div>
        <div class="cmodal-foot">
          <button class="cnext" id="nextbtn">${i+1>=CASES.length?t('seeAssessment','See assessment'):t('nextCase','Next case')} ${icon('arrow')}</button>
        </div>`);
      const nb = byId('nextbtn');
      setKeys(e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); nb.click(); } });
      nb.onclick = ()=>{ closeModal(); i++; if (i>=CASES.length) finish(); else draw(); };
    }
  }

  function finish(){
    clearActors();
    const pct = correct/CASES.length*100;
    const brk = Object.keys(perCat).map(k=>({
      label:k.replace(/_/g,' '),
      pct:Math.round(perCat[k].c/perCat[k].t*100),
      val:perCat[k].c + '/' + perCat[k].t
    }));
    results({
      id:'console', pct, xp:points, breakdown:brk, brkTitle:t('byCat','By red-flag category \u2014 this is what an adaptive engine would route remediation on'),
      headline: correct + '/' + CASES.length + ' ' + t('dispositions','dispositions correct'),
      extra:`<div style="max-width:520px;margin:24px auto 0;text-align:left">
        <div class="drow"><span class="k">${t('fullyJust','Fully correct justifications')}</span><span class="v">${justOK}/${justTotal}</span></div>
        <div class="drow"><span class="k">${t('namingMatters','Naming the indicator matters because')}</span><span class="v" style="max-width:60%;font-family:var(--sans);color:var(--muted);font-size:11.5px">${t('namingWhy','an STR has to record the basis for the decision')}</span></div>
      </div>`,
      again: missionConsole
    });
  }

  brief(m, 'bg-opsfloor', 'elena-explain', speakerElena(), [
    {t:'This is the live queue. Every case in it is a real transaction waiting on a disposition from you: clear it, flag it, or escalate it.', tUr:'یہ لائیو کیو ہے۔ اس میں ہر کیس ایک حقیقی ٹرانزیکشن ہے جو آپ کے ڈسپوزیشن کا انتظار کر رہی ہے: کلیئر کریں، فلیگ کریں، یا ایسکلیٹ کریں۔', v:'17-console-brief-elena-1.mp3'},
    {t:'Flagging is not enough on its own. You have to name the indicator you are acting on, because an STR has to record the basis for the decision \u2014 and so does a decision not to file one.', tUr:'صرف فلیگ کرنا کافی نہیں۔ آپ کو وہ انڈیکیٹر نامزد کرنا ہوگا جس پر آپ عمل کر رہے ہیں، کیونکہ ایس ٹی آر میں فیصلے کی بنیاد درج ہونی چاہیے — اور نہ فائل کرنے کے فیصلے کی بھی۔', v:'18-console-brief-elena-2.mp3'}
  ]).then(()=>{
    clearActors();
    setScene('bg-opsfloor');
    draw();
  });
}

/* =====================================================================
   MODULE 04 — THRESHOLD TRAINER (procedural drills off the rule engine)
   ===================================================================== */
const TT_NAMES = ['Bilal Ahmed','Nadia Khan','Rehan Textiles (Pvt) Ltd','Faisal Traders','Hina Aslam',
                  'Zubair Motors','Karachi Steel Co.','Ayesha Malik','Junaid Brothers','Sadia Rauf'];
const TT_NOTE = {
  none:['Regular activity, well inside the profile recorded at onboarding.',
        'Established relationship, documented purpose, nothing unusual in the pattern.',
        'Routine settlement to a counterparty this account has used for two years.'],
  verify:['Occasional customer with no account relationship at this branch.',
          'Walk-in presenting at the counter for the first time this year.',
          'No existing relationship \u2014 customer is not on file.'],
  ctr:['Explanation offered is plausible and supported by an invoice.',
       'Long-standing customer, consistent with a known seasonal cycle.',
       'Deposit matches a documented property sale.'],
  str:['Customer becomes evasive when asked about the source, and the deposits are shaped just under the verification mark.',
       'Funds were withdrawn within an hour of landing, and no business reason is offered.',
       'The customer abandoned the transaction the moment identification was requested.',
       'Several unrelated companies at the same address are moving funds through this account.'],
  pep:['Account holder is the spouse of a serving federal minister.',
       'Customer is a serving High Court judge.',
       'Signatory is the son of a provincial minister and a director of the company.'],
  npo:['Customer is a registered welfare trust operating relief programmes.',
       'Customer is a registered non-profit organisation.',
       'Charity account collecting seasonal donations.']
};
const rnd = (a,b) => Math.round((a + Math.random()*(b-a)) / 10000) * 10000;
const pick1 = a => a[(Math.random()*a.length)|0];
function ttNotes(kind){
  return (isUr() && UR().ttNote && UR().ttNote[kind]) ? UR().ttNote[kind] : TT_NOTE[kind];
}

function makeDrill(kind){
  const who = pick1(TT_NAMES);
  switch(kind){
    case 'none': {
      const cash = Math.random() < .5;
      return {who, cash, party:'existing', suspicion:false,
              amount: cash ? rnd(40000, 460000) : rnd(120000, 1800000),
              type: cash ? 'Cash deposit' : 'Outgoing transfer',               note: pick1(ttNotes('none'))};
    }
    case 'verify':
      return {who, cash:true, party:'walkin', suspicion:false,
              amount: rnd(510000, 1900000), type:'Cash deposit', note: pick1(ttNotes('verify'))};
    case 'ctr':
      return {who, cash:true, party: Math.random()<.5 ? 'existing' : 'walkin', suspicion:false,
              amount: rnd(2000000, 3600000),
              type: Math.random()<.5 ? 'Cash deposit' : 'Cash withdrawal', note: pick1(ttNotes('ctr'))};
    case 'str': {
      const cash = Math.random() < .6;
      return {who, cash, party:'existing', suspicion:true,
              amount: rnd(60000, 1500000),
              type: cash ? 'Cash deposit' : 'Incoming transfer', note: pick1(ttNotes('str'))};
    }
    case 'edd': {
      const party = Math.random() < .5 ? 'pep' : 'npo';
      return {who, cash: Math.random()<.5, party, suspicion:false,
              amount: rnd(30000, 1200000),
              type: Math.random()<.5 ? 'Cash deposit' : 'Outgoing transfer',
              note: pick1(ttNotes(party))};
    }
  }
}

function missionThresholds(){
  const m = MISSIONS.find(x=>x.id==='thresholds');
  const plan = shuffle(['none','none','verify','verify','ctr','ctr','ctr','str','str','edd','edd','edd']);
  const drills = plan.map(makeDrill);
  const ROUNDS = drills.length, LIMIT = 22;
  let i = 0, correct = 0, points = 0, streak = 0, bestStreak = 0;
  const perKind = {};
  let elenaA = null;

  function draw(){
    const tx = drills[i];
    const ans = resolveObligation(tx);
    let left = LIMIT, locked = false;

    go(`
      ${missionHead(m, `
        <div class="hudpill"><span class="lbl">${t('drill','Drill')}</span><b>${i+1}/${ROUNDS}</b></div>
        <div class="hudpill"><span class="lbl">${t('correctLbl','Correct')}</span><b style="color:var(--teal)">${correct}</b></div>
        <div class="hudpill"><span class="lbl">${t('streak','Streak')}</span><b class="combo">${streak}</b></div>`)}
      <div class="panel" style="max-width:min(100%,720px)">
        <div class="hud-row" style="margin-bottom:14px">
          ${ringHTML('tring')}
          <div class="tt-ctx" style="flex:1;margin:0">
            <div class="who">${tx.who} \u00b7 ${locType(UR().ttTypes, tx.type)}</div>
            <div class="note">${tx.note}</div>
          </div>
        </div>
        <div class="gauge">${gaugeSVG(tx.amount, tx.cash)}</div>
        <div style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:14px;line-height:1.6">
          ${t('primaryHint','Name the <b style="color:var(--ink)">primary</b> obligation. Where more than one could apply the higher duty wins:')}
          STR &rsaquo; EDD &rsaquo; CTR &rsaquo; verify &rsaquo; none.
        </div>
        <div id="choiceslot"></div>
        <div id="fbslot"></div>
      </div>
    `);
    bindBack();
    ringSet('tring', 1, LIMIT);
    choices(TT_OPTIONS.map(o=>({t:`<b style="color:var(--ink)">${lu(o,'n')}</b> \u2014 ${lu(o,'d')}`})),
            {prompt:t('namePrimary','Name the primary obligation.')})
      .then(ix=>{ const o = TT_OPTIONS[ix];
                  pick(o.k, document.querySelector(`#crows .crow[data-i="${ix}"]`)); });

    const t = setInterval(()=>{
      left -= 0.1;
      ringSet('tring', left/LIMIT, left);
      if (left <= 0){ clearInterval(t); if (!locked) pick(null); }
    }, 100);
    activeTimers.push(t);

    function pick(k, btn){
      if (locked) return;
      locked = true; clearInterval(t);
      const ok = k === ans.k;
      perKind[ans.k] = perKind[ans.k] || {c:0,t:0};
      perKind[ans.k].t++;
      if (ok){
        perKind[ans.k].c++; correct++; streak++; bestStreak = Math.max(bestStreak, streak);
        points += 12 + Math.min(12, (streak-1)*2) + Math.round(left/3);
        beep('good');
      } else { streak = 0; beep('bad'); }

      document.querySelectorAll('#crows .crow').forEach((el,ix)=>{
        el.disabled = true;
        el.onclick = null;
        if (TT_OPTIONS[ix].k === ans.k) el.classList.add('good');
        else if (el === btn) el.classList.add('bad');
        else el.classList.add('faded');
      });
      if (elenaA) elenaA.mood(ok ? 'elena-explain' : 'elena-concern');

      openModal(`
        <div class="verdict ${ok?'good':'bad'}">
          <span class="vt">${ok?t('correct','Correct'):k===null?t('timeExpired','Time expired'):t('incorrect','Incorrect')}</span>
          ${ans.why}
          <span class="cite">${t('reference','Reference')} \u2014 Key thresholds \u00a72</span>
        </div>
        <div class="cmodal-foot">
          <button class="cnext" id="nextbtn">${i+1>=ROUNDS?t('seeAssessment','See assessment'):t('nextDrill','Next drill')} ${icon('arrow')}</button>
        </div>`);
      const nb = byId('nextbtn');
      setKeys(e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); nb.click(); } });
      nb.onclick = ()=>{ closeModal(); i++; if (i>=ROUNDS) finish(); else draw(); };
    }
  }

  function finish(){
    clearActors();
    const pct = correct/ROUNDS*100;
    const names = isUr() && UR().ttKindNames ? UR().ttKindNames : {NONE:'No report required', VERIFY:'Walk-in verification', CTR:'CTR \u00b7 PKR 2M cash', STR:'STR \u00b7 any amount', EDD:'EDD \u00b7 PEP &amp; NPO'};
    const brk = Object.keys(perKind).map(k=>({
      label:names[k], pct:Math.round(perKind[k].c/perKind[k].t*100), val:perKind[k].c + '/' + perKind[k].t
    }));
    results({
      id:'thresholds', pct, xp:points, breakdown:brk, brkTitle:t('byObligation','By obligation type'),
      headline: correct + '/' + ROUNDS + ' ' + t('correctLbl','correct') + ' \u00b7 ' + t('bestStreak','best streak') + ' ' + bestStreak,
      again: missionThresholds
    });
  }

  brief(m, 'bg-boardroom', 'elena-explain', speakerElena(), [
    {t:'Thresholds are the part you cannot look up mid-conversation. Two million rupees in cash triggers a CTR whether or not anything looks wrong. Five hundred thousand from a walk-in triggers identity verification. An STR has no floor at all.', tUr:'تھریشولڈز وہ حصّہ ہیں جو گفتگو کے درمیان دیکھے نہیں جا سکتے۔ نقد میں بیس لاکھ روپے سی ٹی آر چالو کرتے ہیں، چاہے کچھ غلط نظر نہ آئے۔ واک اِن سے پانچ لاکھ شناخت کی تصدیق چالو کرتے ہیں۔ ایس ٹی آر کی کوئی نیچلی حد ہی نہیں۔', v:'19-thresholds-brief-elena-1.mp3'},
    {t:'Twelve drills, twenty-two seconds each. Where more than one obligation could apply, the higher duty wins.', tUr:'بارہ ڈرلز، ہر ایک بائیس سیکنڈ۔ جہاں ایک سے زیادہ فرض لاگو ہو سکیں، اونچا فرض جیتتا ہے۔', v:'20-thresholds-brief-elena-2.mp3'}
  ]).then(()=>{
    clearActors();
    setScene('bg-boardroom');
    elenaA = actor('elena-explain','right',{id:'mentor'});
    draw();
  });
}

/* =====================================================================
   REFERENCE VAULT
   ===================================================================== */
function screenVault(){
  setKeys(null);
  clearActors();
  setScene(null);
  const m = MISSIONS.find(x=>x.id==='vault');
  go(`
    ${missionHead(m, `<div class="hudpill"><span class="lbl">${t('opened','Opened')}</span><b id="seencount">${S.seen.length}/${GLOSSARY.length}</b></div>`)}
    <div class="panel alt" style="margin-bottom:18px;font-size:13px;color:var(--muted);line-height:1.7">
      ${t('vaultBlurb','Every rule the four modules test, in one place. Tap a card to turn it over. These are paraphrased working definitions for training \u2014 the binding text is the SBP regulation itself.')}
    </div>
    <div class="vgrid">
      ${GLOSSARY.map((g,ix)=>`
        <div class="vcard ${S.seen.includes(g.k)?'was-seen':''}" data-i="${ix}">
          <div class="vinner">
            <div class="vface vfront">
              <span class="vseen"></span>
              <div><div class="vk">${g.k}</div></div>
              <div class="vt">${lu(g,'t')}</div>
              <div class="hint">${t('tapReveal','Tap to reveal \u2192')}</div>
            </div>
            <div class="vface vback">
              <p>${lu(g,'d')}</p>
              <div class="src">${g.s}</div>
            </div>
          </div>
        </div>`).join('')}
    </div>
  `);
  bindBack();
  stage.querySelectorAll('.vcard').forEach(el=>{
    el.onclick = ()=>{
      el.classList.toggle('flip');
      const g = GLOSSARY[el.dataset.i];
      if (!S.seen.includes(g.k)){
        S.seen.push(g.k); save(); beep('tick');
        el.classList.add('was-seen');
        byId('seencount').textContent = S.seen.length + '/' + GLOSSARY.length;
        if (S.seen.length >= GLOSSARY.length) awardBadge('vault');
      }
    };
  });
}

/* =====================================================================
   CREDENTIAL
   ===================================================================== */
function screenCertificate(avg){
  setKeys(null);
  clearActors();
  setScene('bg-hall');
  actor('elena-explain','left',{id:'mentor'});
  actor('marcus-neutral','right',{id:'peer'});
  const r = rankOf(S.xp);
  const passed = avg >= 70;
  const date = new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});
  go(`
    <style>@media print{
      body{background:#fff}#fx,#confetti,#cine,#actors,.skipbtn,.topbar,.res-actions,#toasts,.mhead{display:none!important}
      .cert{border-color:#B9963C;background:#fff;color:#111}
      .cert h3,.cert .cline div{color:#111}.cert .cn,.cert .cline span{color:#555}
    }</style>
    ${missionHead({k:t('credential','Credential'), n:t('programmeRecord','Programme record'), c:'#C9962C'}, '')}
    <div class="cert">
      <div class="seal">${sealSVG()}</div>
      <div class="ct">Sentinel AML / KYC Academy</div>
      <h3>${passed ? t('programmeDone','Programme completed') : t('provisional','Provisional record')}</h3>
      <div class="cn">
        ${t('certBody','All four training modules attempted across customer due diligence, red-flag recognition, transaction disposition and reporting thresholds, based on the SBP AML/CFT regulations for banks and DFIs.')}
        ${passed ? '' : '<br><br>' + t('certNeed','A 70% average across modules is needed for a full completion record \u2014 replay the weaker modules to lift it.')}
      </div>
      <div class="cline">
        <div>${avg}%<span>${t('average','Average')}</span></div>
        <div>${S.xp}<span>${t('xp','Total XP')}</span></div>
        <div>${lu(r,'n')}<span>${t('rankAttained','Rank attained')}</span></div>
        <div>${S.badges.length}/${BADGES.length}<span>${t('badges','Badges')}</span></div>
        <div>${date}<span>${t('issued','Issued')}</span></div>
      </div>
    </div>
    <div class="res-actions">
      <button class="btn primary" id="printbtn">${t('printPdf','Print / save as PDF')}</button>
      <button class="btn ghost" id="homebtn2">${t('backAcademy','Back to academy')}</button>
    </div>
    <div class="note">${t('certNote','Simulation record only. This is a training prototype and carries no regulatory or certification standing.')}</div>
  `);
  bindBack();
  byId('printbtn').onclick = ()=>window.print();
  byId('homebtn2').onclick = home;
  if (passed) confetti();
}

/* =====================================================================
   COLD OPEN
   ===================================================================== */
function coldOpen(){
  return new Promise(resolve=>{
    setKeys(null);
    setScene('bg-skyline');

    const skip = document.createElement('button');
    skip.className = 'skipbtn';
    skip.textContent = t('skipIntro','Skip intro');
    rootEl().appendChild(skip);

    let cancelled = false;
    const finish = ()=>{
      if (cancelled) return;
      cancelled = true;
      stopVoice();
      skip.remove();
      clearActors();
      S.seenIntro = true; save();
      resolve();
    };
    skip.onclick = finish;

    stage.innerHTML = `<div class="screen" style="min-height:66vh;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:26px;text-align:center">
      <div id="titleslot">
        <div class="eyebrow" style="justify-content:center">${t('heroEyebrow','SBP AML/CFT &middot; Training simulation')}</div>
        <h1 style="font-size:44px;line-height:1.08;font-weight:700;letter-spacing:-.02em;margin-top:12px">
          SENTINEL</h1>
      </div>
      <div id="bubbleslot" style="max-width:640px"></div>
      <div id="ctaslot"></div>
    </div>`;

    (async ()=>{
      await new Promise(r=>setTimeout(r, 700));
      if (cancelled) return;

      actor('elena-explain','right');
      await new Promise(r=>setTimeout(r, 500));
      if (cancelled) return;
      await say(speakerElenaRole(),
        isUr()
          ? 'آپ پیسے منتقل ہونے سے پہلے آخری کنٹرول ہیں۔ اوپر جو کچھ ہے وہ کاغذی کارروائی ہے۔ نیچے جو ہے وہ کسی اور کا مسئلہ ہے۔'
          : 'You are the last control before the money moves. Everything upstream of you is paperwork. Everything downstream is somebody else\u2019s problem.',
        {voice:'01-intro-elena.mp3'});
      if (cancelled) return;

      actor('marcus-neutral','left');
      await new Promise(r=>setTimeout(r, 450));
      if (cancelled) return;
      await say(speakerMarcusRole(),
        isUr()
          ? 'چار ماڈیولز ہیں۔ ایک ایسا کسٹمر آن بورڈ کرو جو ٹھیک طریقے سے آن بورڈ نہیں ہونا چاہتا، ریڈ فلیگ فیملیز نظر سے پہچانو، لائیو ٹرانزیکشن کیو سنبھالو، اور تھریشولڈز اتنے رٹا لو کہ ریفلیکس بن جائیں۔'
          : 'Four modules. Onboard a customer who does not want to be onboarded properly, learn the red-flag families by sight, work a live transaction queue, and drill the thresholds until they are reflex.',
        {append:true, voice:'02-intro-marcus.mp3'});
      if (cancelled) return;

      const slot = byId('ctaslot');
      if (!slot || cancelled) return;
      slot.innerHTML =
        `<button class="cnext" id="beginbtn" style="margin:0">${t('begin','Begin training')}</button>`;
      const bb = byId('beginbtn');
      bb.onclick = ()=>{ beep('pick'); finish(); };
      setKeys(e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); bb.click(); } });
    })();
  });
}

/* =====================================================================
   SPLASH
   ===================================================================== */
function splash(){
  return new Promise(resolve=>{
    const el = byId('splash');
    const bar = byId('splashbar');
    const status = byId('splashstatus');
    if (!el){ resolve(); return; }

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minMs = reduce ? 220 : 1700;
    const keys = ['bg-skyline','elena-explain','marcus-neutral'];
    let imgDone = 0, finished = false, raf = 0;
    const t0 = performance.now();

    const finish = ()=>{
      if (finished || !_alive) return;
      finished = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      if (bar) bar.style.width = '100%';
      if (status) status.textContent = t('ready','Ready');
      el.classList.add('out');
      setTimeout(()=>{
        if (!_alive) return;
        rootEl().classList.remove('splashing');
        el.remove();
        resolve();
      }, reduce ? 80 : 460);
    };

    const onKey = e=>{
      if (e.target.closest && e.target.closest('.splash-lang')) return;
      if (e.key==='Enter' || e.key===' ' || e.key==='Escape'){
        e.preventDefault();
        finish();
      }
    };
    const langBox = byId('splashlang');
    if (langBox){
      langBox.addEventListener('click', e=>{
        e.stopPropagation();
        const btn = e.target.closest('.splash-langbtn');
        if (!btn) return;
        setLang(btn.dataset.lang, true);
        beep('pick');
      });
    }
    el.addEventListener('click', e=>{
      if (e.target.closest('.splash-lang')) return;
      finish();
    });
    document.addEventListener('keydown', onKey);

    keys.forEach(k=>{
      const img = new Image();
      img.onload = img.onerror = ()=>{ imgDone++; };
      img.src = ART[k];
    });

    const loop = now=>{
      if (finished) return;
      const timePct = Math.min(1, (now - t0) / minMs);
      const imgPct = imgDone / keys.length;
      const pct = Math.min(1, timePct * 0.55 + imgPct * 0.45);
      if (bar) bar.style.width = (pct * 100).toFixed(1) + '%';
      if (timePct >= 1 && imgDone >= keys.length) finish();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    setTimeout(finish, 4500);
  });
}

/* =====================================================================
   BOOT
   ===================================================================== */
let _booted = false;
export function destroy(){
  _alive = false;
  _booted = false;
  _ambientGen++;
  _ambientRunning = false;
  if (_ambientRaf) cancelAnimationFrame(_ambientRaf);
  _ambientRaf = 0;
  if (_onResize){
    removeEventListener('resize', _onResize);
    _onResize = null;
  }
  if (_pointerDown){
    document.removeEventListener('pointerdown', _pointerDown, true);
    _pointerDown = null;
  }
  setKeys(null);
  stopVoice();
  clearTimers();
  closeModal();
  rootEl().querySelectorAll('.skipbtn').forEach(el=>el.remove());
  rootEl().classList.remove('scene','splashing','lang-ur');
  rootEl().style.overflow = '';
  stage = null;
  host = null;
}

export function boot(opts){
  opts = opts || {};
  if (_booted) destroy();
  host = opts.root || document.querySelector('.aml-urdu-root') || document.body;
  _onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  _completedFired = false;
  _alive = true;
  _booted = true;
  stage = byId('stage');
  if (!stage) return;
  startAmbient();
  byId('brand').onclick = home;
  byId('soundbtn').onclick = ()=>{
    S.muted = !S.muted; save(); renderSoundBtn();
    if (S.muted){
      muteVoice();
    } else {
      try{ if (AC && AC.state === 'suspended') AC.resume(); }catch(e){}
      if (!unmuteVoice()) beep('pick');
    }
  };
  byId('langbtn').onclick = ()=> setLang(isUr() ? 'en' : 'ur');
  byId('resetbtn').onclick = ()=>{
    if (!confirm(t('resetConfirm','Reset all progress — XP, ranks, badges and best scores?'))) return;
    S = {xp:0, best:{}, badges:[], seen:[], muted:S.muted, seenIntro:true, lang:S.lang};
    save(); renderRank(); home();
    toast(t('resetToast','Progress reset'), t('resetToastD','Back to Trainee with a clean record.'));
  };
  
  hydrateTtNote();
  load();
  if (opts.lang === 'ur' || opts.lang === 'en') S.lang = opts.lang;
  applyLang();
  renderRank();
  renderSoundBtn();
  _pointerDown = e=>{
    if (!_voice || !_voice.paused || _voice.ended) return;
    if (e.target.closest('#cmodal, .crow, .act, .cnext, .chip, #confirm, #soundbtn, #langbtn')) return;
    _voice.play().catch(()=>{});
  };
  document.addEventListener('pointerdown', _pointerDown, true);
  splash().then(()=>{
    if (!_alive) return;
    if (S.seenIntro) home();
    else coldOpen().then(()=>{ if (_alive) home(); });
  });
}
