import { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  Inbox,
  FileText,
  Info,
  Trophy,
  Target,
  BarChart3,
  RefreshCcw,
  Eye,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  X,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Difficulty, type Email, EmailType, type GameStats } from './types';
import { MOCK_EMAILS } from './constants';
import { LangToggleGame } from '../../../../components/LangToggle';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { THREAT_SPOTTER_UR } from '../../../../i18n/module1';
import { localizeEmail } from '../../../../i18n/phishingEmails.ur';

const EMAIL_COUNT = 8;
const TOTAL_SCORE = 100;
const POINTS_CORRECT = TOTAL_SCORE / EMAIL_COUNT; // 12.5 each → max 100

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

type PhishingDefenderProps = {
  onExit?: () => void;
};

export default function App({ onExit }: PhishingDefenderProps) {
  const { t, isUr } = useLanguage();
  const ur = THREAT_SPOTTER_UR;
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'inbox' | 'threats' | 'safe'>('inbox');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastDecision, setLastDecision] = useState<{
    email: Email;
    correct: boolean;
    userChoice: EmailType;
  } | null>(null);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    falsePositives: 0,
    missed: 0,
    totalProcessed: 0,
    score: 0,
    level: 1,
    accuracy: 0,
  });
  const [analyzedFields, setAnalyzedFields] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setEmails(shuffleArray(MOCK_EMAILS).slice(0, EMAIL_COUNT));
  }, []);

  const selectedEmail = useMemo(() => {
    const found = emails.find(e => e.id === selectedEmailId);
    return found ? localizeEmail(found, isUr) : undefined;
  }, [emails, selectedEmailId, isUr]);

  const inboxEmails = useMemo(() =>
    emails.filter(e => !e.isReported),
    [emails]
  );
  const threatEmails = useMemo(() =>
    emails.filter(e => e.isReported && (e.userChoice === EmailType.PHISHING || e.userChoice === EmailType.SPAM)),
    [emails]
  );
  const safeEmails = useMemo(() =>
    emails.filter(e => e.isReported && e.userChoice === EmailType.LEGITIMATE),
    [emails]
  );

  const isComplete = emails.length > 0 && inboxEmails.length === 0;

  const displayedEmails = useMemo(() => {
    if (currentTab === 'inbox') return inboxEmails;
    if (currentTab === 'threats') return threatEmails;
    return safeEmails;
  }, [currentTab, inboxEmails, threatEmails, safeEmails]);

  useEffect(() => {
    if (stats.totalProcessed > 0) {
      const accuracy = (stats.correct / stats.totalProcessed) * 100;
      setStats(prev => ({ ...prev, accuracy }));
    }
  }, [stats.totalProcessed, stats.correct]);

  const handleDecision = (type: EmailType) => {
    if (!selectedEmail) return;

    const isCorrect = selectedEmail.type === type;

    setLastDecision({
      email: selectedEmail,
      correct: isCorrect,
      userChoice: type,
    });

    setStats(prev => {
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      const newFalsePositives = (!isCorrect && type === EmailType.PHISHING) ? prev.falsePositives + 1 : prev.falsePositives;
      const newMissed = (!isCorrect && selectedEmail.type === EmailType.PHISHING) ? prev.missed + 1 : prev.missed;
      const newTotal = prev.totalProcessed + 1;
      const newScore = isCorrect
        ? Math.min(TOTAL_SCORE, prev.score + POINTS_CORRECT)
        : prev.score;
      const newLevel = Math.floor(newTotal / 5) + 1;

      return {
        ...prev,
        correct: newCorrect,
        falsePositives: newFalsePositives,
        missed: newMissed,
        totalProcessed: newTotal,
        score: newScore,
        level: newLevel,
      };
    });

    setEmails(prev => prev.map(e =>
      e.id === selectedEmailId ? { ...e, isReported: true, userChoice: type } : e
    ));

    setShowFeedback(true);
    setAnalyzedFields(newSet => {
      newSet.clear();
      return newSet;
    });
  };

  const toggleAnalyze = (field: string) => {
    setAnalyzedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const resetGame = () => {
    // Shuffle and pick a fresh set of emails for the new session
    const freshEmails = shuffleArray(MOCK_EMAILS)
      .slice(0, EMAIL_COUNT)
      .map(e => ({ ...e, isReported: false, isRead: false }));

    setEmails(freshEmails);
    setSelectedEmailId(null);
    setStats({
      correct: 0,
      falsePositives: 0,
      missed: 0,
      totalProcessed: 0,
      score: 0,
      level: 1,
      accuracy: 0,
    });
    setCurrentTab('inbox');
    setShowFeedback(false);
  };

  const handleExit = () => {
    onExit?.();
  };

  if (isComplete && !showFeedback) {
    return (
      <ResultScreen
        stats={stats}
        threatCount={threatEmails.length}
        safeCount={safeEmails.length}
        onRetry={resetGame}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 min-h-dvh overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExit}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            title={t('exit')}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-blue rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 leading-none text-sm sm:text-base truncate">
              {isUr ? ur.phishingDefender : 'Phishing Defender'}
            </h2>
            <span className="text-[8px] sm:text-[10px] font-bold text-primary-blue uppercase tracking-widest hidden sm:block">
              {isUr ? ur.soc : 'Security Operations Center'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isUr ? ur.level : 'Level'}
              </div>
              <div className="font-bold text-slate-900">{stats.level}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('score')}</div>
              <div className="font-bold text-primary-blue">{Math.round(stats.score)}/{TOTAL_SCORE}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isUr ? ur.accuracy : 'Accuracy'}
              </div>
              <div className="font-bold text-emerald-600">{stats.accuracy.toFixed(0)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LangToggleGame />
            <button
              onClick={resetGame}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title={isUr ? ur.resetGame : 'Reset Game'}
            >
              <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-primary-blue"
              title={isUr ? ur.helpTips : 'Help & Tips'}
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-right border-slate-200 flex flex-col p-4 gap-2 hidden md:flex">
          <button
            onClick={() => setCurrentTab('inbox')}
            className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-all ${currentTab === 'inbox' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Inbox className="w-5 h-5" />
            <span>{isUr ? ur.inbox : 'Inbox'}</span>
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${currentTab === 'inbox' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
              {inboxEmails.length}
            </span>
          </button>
          <button
            onClick={() => setCurrentTab('threats')}
            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${currentTab === 'threats' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{isUr ? ur.threats : 'Threats'}</span>
            {threatEmails.length > 0 && (
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${currentTab === 'threats' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                {threatEmails.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('safe')}
            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${currentTab === 'safe' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isUr ? ur.safe : 'Safe'}</span>
            {safeEmails.length > 0 && (
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${currentTab === 'safe' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                {safeEmails.length}
              </span>
            )}
          </button>
          <div className="mt-auto p-4 bg-slate-900 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                {isUr ? ur.performance : 'Performance'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-60">{isUr ? ur.correct : 'Correct'}</span>
                <span className="text-xs font-bold">{stats.correct}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-60">{isUr ? ur.falsePositives : 'False Positives'}</span>
                <span className="text-xs font-bold text-rose-400">{stats.falsePositives}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-60">{isUr ? ur.missed : 'Missed'}</span>
                <span className="text-xs font-bold text-amber-400">{stats.missed}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Email List */}
        <section className={`${selectedEmail ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white border-r border-slate-200 flex-col overflow-hidden shrink-0`}>
          <div className="p-4 border-bottom border-slate-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isUr ? ur.searchInbox : 'Search inbox...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {displayedEmails.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{currentTab === 'inbox' ? 'Inbox Sanitized' : 'No emails here'}</h3>
                <p className="text-xs text-slate-500">
                  {currentTab === 'inbox' ? 'All current threats have been processed. Good job, analyst.' : `Explore other folders to see filtered emails.`}
                </p>
              </div>
            ) : (
              displayedEmails.map((email: Email) => {
                const localized = localizeEmail(email, isUr);
                return (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`w-full p-4 text-left border-bottom border-slate-50 transition-all hover:bg-slate-50 flex gap-3 ${selectedEmailId === email.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${email.difficulty === Difficulty.HARD ? 'bg-rose-100 text-rose-600' : email.difficulty === Difficulty.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {localized.fromName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-900 truncate">{localized.fromName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{localized.date}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 truncate mb-1">{localized.subject}</div>
                    <div className="text-xs text-slate-400 truncate">{localized.body}</div>
                  </div>
                </button>
                );
              })
            )}
          </div>
        </section>

        {/* Email Viewer */}
        <section className={`${!selectedEmail ? 'hidden md:flex' : 'flex'} flex-1 bg-white flex-col overflow-hidden`}>
          {selectedEmail ? (
            <>
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => setSelectedEmailId(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">{selectedEmail.subject}</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!selectedEmail.isReported ? (
                    <>
                      <button
                        onClick={() => handleDecision(EmailType.PHISHING)}
                        className="px-3 sm:px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none justify-center"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Report Phishing
                      </button>
                      <button
                        onClick={() => handleDecision(EmailType.SPAM)}
                        className="px-3 sm:px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                        Mark Spam
                      </button>
                      <button
                        onClick={() => handleDecision(EmailType.LEGITIMATE)}
                        className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none justify-center w-full sm:w-auto mt-1 sm:mt-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Legitimate
                      </button>
                    </>
                  ) : (
                    <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${selectedEmail.userChoice === selectedEmail.type ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {selectedEmail.userChoice === selectedEmail.type ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{selectedEmail.userChoice === selectedEmail.type ? 'Resolved: Correct' : 'Resolved: Breach'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-3xl mx-auto">
                  {/* Sender Info */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm font-bold text-slate-400">
                      {selectedEmail.fromName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 mb-0.5 sm:mb-0">
                        <span className="font-bold text-slate-900 truncate">{selectedEmail.fromName}</span>
                        <span className="text-xs text-slate-400 truncate">&lt;{analyzedFields.has('from') ? selectedEmail.fromEmail : '••••••••••••••••'}&gt;</span>
                      </div>
                      <div className="text-xs text-slate-500">To: me@corporate.com</div>
                    </div>
                    <button
                      onClick={() => toggleAnalyze('from')}
                      className={`p-2 rounded-lg transition-all ${analyzedFields.has('from') ? 'bg-primary-blue text-white' : 'bg-white text-slate-400 hover:text-primary-blue shadow-sm'}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Email Body */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-8 shadow-sm mb-6 min-h-[300px] relative">
                    <div className="prose prose-slate max-w-none">
                      <p className="whitespace-pre-wrap text-sm sm:text-base text-slate-700 leading-relaxed overflow-hidden break-words">
                        {selectedEmail.body}
                      </p>
                    </div>

                    {/* Links if any */}
                    {(selectedEmail.displayLink || selectedEmail.actualLink) && (
                      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
                        <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:flex-1">
                          <div className="w-8 h-8 shrink-0 bg-white rounded-lg flex items-center justify-center text-primary-blue shadow-sm mt-1 sm:mt-0">
                            <Target className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Embedded Link</div>
                            <div className="text-sm font-medium text-indigo-700 truncate min-w-0 w-full" title={analyzedFields.has('link') ? selectedEmail.actualLink : selectedEmail.displayLink}>
                              {analyzedFields.has('link') ? selectedEmail.actualLink : selectedEmail.displayLink}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAnalyze('link')}
                          className={`w-full sm:w-auto p-2 rounded-lg transition-all flex items-center justify-center shrink-0 ${analyzedFields.has('link') ? 'bg-primary-blue text-white' : 'bg-white text-indigo-400 hover:bg-indigo-50 shadow-sm'}`}
                        >
                          <Search className="w-4 h-4" />
                          <span className="ml-2 text-sm font-bold sm:hidden">{analyzedFields.has('link') ? 'Hide Real Link' : 'Analyze Link'}</span>
                        </button>
                      </div>
                    )}

                    {/* Attachment if any */}
                    {selectedEmail.attachment && (
                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <div className="text-sm font-bold text-slate-900 truncate" title={selectedEmail.attachment.name}>{selectedEmail.attachment.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{selectedEmail.attachment.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-white rounded border border-slate-100 flex-1 sm:flex-none text-center">Scan Clean</span>
                          <button className="p-2 bg-white text-slate-400 hover:text-primary-blue rounded-lg shadow-sm">
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 text-slate-400">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    <div className="text-[10px] font-bold uppercase tracking-widest">End of Message</div>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 text-slate-200" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Select an email to analyze</h2>
              <p className="text-sm max-w-xs">Carefully examine every detail. Phishers are getting smarter every day.</p>
            </div>
          )}
        </section>
      </main>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && lastDecision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              <div className={`p-8 text-center ${lastDecision.correct ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${lastDecision.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {lastDecision.correct ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${lastDecision.correct ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {lastDecision.correct ? 'Excellent Catch!' : 'Security Breach!'}
                </h2>
                <p className={`text-sm font-medium ${lastDecision.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {lastDecision.correct
                    ? `You correctly identified this as ${lastDecision.email.type.toLowerCase()}.`
                    : `This was actually a ${lastDecision.email.type.toLowerCase()} email.`
                  }
                </p>
              </div>

              <div className="p-8">
                {lastDecision.email.type === EmailType.PHISHING && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Phishing Indicators
                    </h3>
                    <ul className="space-y-2">
                      {localizeEmail(lastDecision.email, isUr).indicators.map((indicator, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-primary-blue shadow-sm">
                            {idx + 1}
                          </div>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lastDecision.email.type === EmailType.LEGITIMATE && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Info className="w-3 h-3 text-indigo-500" />
                      Why it was safe
                    </h3>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      This email came from a verified domain and followed standard corporate communication patterns without suspicious requests or links.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setSelectedEmailId(null);
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
                >
                  {emails.every(e => e.isReported) ? 'View Results' : 'Continue Analysis'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-bottom border-slate-100 flex items-center justify-between bg-primary-blue text-white">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Security Analyst Handbook</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-primary-blue uppercase tracking-widest mb-4">How to Play</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="font-bold text-slate-900 mb-1">1. Analyze</div>
                        <p className="text-xs text-slate-600">Use the eye and search icons to reveal hidden details like the actual sender email and link URLs.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="font-bold text-slate-900 mb-1">2. Decide</div>
                        <p className="text-xs text-slate-600">Choose if the email is Phishing, Spam, or Legitimate based on your findings.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-primary-blue uppercase tracking-widest mb-4">Phishing Indicators</h3>
                    <div className="space-y-3">
                      <div className="flex gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 text-rose-500 shadow-sm">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-rose-900 text-sm">Sense of Urgency</div>
                          <p className="text-xs text-rose-700">Phrases like "Immediate action required" or "Account will be suspended" are used to make you act without thinking.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 text-amber-500 shadow-sm">
                          <Search className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-amber-900 text-sm">Domain Mismatches</div>
                          <p className="text-xs text-amber-700">Look for subtle typos in the sender's email address (e.g., amozon.com instead of amazon.com).</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 text-indigo-500 shadow-sm">
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-indigo-900 text-sm">Suspicious Links</div>
                          <p className="text-xs text-indigo-700">Hover over or analyze links. The display text might say "company.com" but the actual destination is different.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-primary-blue uppercase tracking-widest mb-4">Scoring System</h3>
                    <div className="p-6 bg-slate-900 rounded-3xl text-white">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm">Correct Identification</span>
                        </div>
                        <span className="font-bold text-emerald-400">+{POINTS_CORRECT} pts</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-sm">Incorrect Decision</span>
                        </div>
                        <span className="font-bold text-rose-400">0 pts</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <span className="text-sm text-slate-300">Max score ({EMAIL_COUNT} emails)</span>
                        <span className="font-bold text-cyan-300">{TOTAL_SCORE} pts</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-6 border-top border-slate-100 bg-slate-50">
                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full py-4 bg-primary-blue text-white rounded-2xl font-bold transition-all"
                >
                  Got it, let's protect the company!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultScreen({
  stats,
  threatCount,
  safeCount,
  onRetry,
  onExit,
}: {
  stats: GameStats;
  threatCount: number;
  safeCount: number;
  onRetry: () => void;
  onExit: () => void;
}) {
  const { t, isUr } = useLanguage();
  const ur = THREAT_SPOTTER_UR;
  const passed = stats.accuracy >= 70;
  const rank =
    stats.accuracy === 100
      ? 'Elite Analyst'
      : passed
        ? 'Inbox Secured'
        : stats.accuracy >= 40
          ? 'Needs Another Shift'
          : 'Phish Got Through';
  const tip =
    stats.accuracy === 100
      ? 'Perfect read — every phishing attempt, spam lure, and legit message was sorted correctly.'
      : passed
        ? 'Solid shift. Keep probing sender domains and real link destinations before you decide.'
        : 'Review urgency cues and lookalike domains — those are the traps that slip past most analysts.';

  return (
    <div className="fixed inset-0 z-50 min-h-dvh overflow-y-auto bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className={`p-8 text-center ${passed ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${
              passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {passed ? <Trophy className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">{t('debrief')}</p>
          <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${passed ? 'text-emerald-900' : 'text-rose-900'}`}>
            {rank}
          </h2>
          <p className={`text-sm leading-relaxed max-w-sm mx-auto ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
            {tip}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{t('score')}</div>
              <div className="text-2xl font-black text-primary-blue">{Math.round(stats.score)}/{TOTAL_SCORE}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {isUr ? ur.accuracy : 'Accuracy'}
              </div>
              <div className="text-2xl font-black text-emerald-600">{stats.accuracy.toFixed(0)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 mb-1">
                {isUr ? ur.correct : 'Correct'}
              </div>
              <div className="text-lg font-bold text-emerald-700">{stats.correct}</div>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600/80 mb-1">
                {isUr ? ur.falsePositives : 'False +'}
              </div>
              <div className="text-lg font-bold text-rose-700">{stats.falsePositives}</div>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80 mb-1">
                {isUr ? ur.missed : 'Missed'}
              </div>
              <div className="text-lg font-bold text-amber-700">{stats.missed}</div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm">
            <span className="opacity-80">{isUr ? ur.threats : 'Filed as threats'}</span>
            <span className="font-bold">{threatCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-100 text-slate-700 px-4 py-3 text-sm -mt-2">
            <span>{isUr ? ur.safe : 'Marked safe'}</span>
            <span className="font-bold">{safeCount}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-4 bg-primary-blue text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              {t('playAgain')}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              {t('backToModule')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
