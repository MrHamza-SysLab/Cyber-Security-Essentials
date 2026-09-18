import { Check, ChevronDown, Gamepad2, Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { findLesson, getTraining } from '../data/trainings'
import { useLanguage } from '../i18n/LanguageContext'
import { localizeTraining } from '../i18n/trainings.ur'

export default function CourseContent() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { t, isUr } = useLanguage()
  const rawTraining = getTraining(courseId)
  const training = useMemo(
    () => (rawTraining ? localizeTraining(rawTraining, isUr) : null),
    [rawTraining, isUr],
  )
  const [showGameNote, setShowGameNote] = useState(false)
  const [expanded, setExpanded] = useState({})

  const firstLesson = training?.modules[0]?.lessons[0]
  const selectedId = lessonId || firstLesson?.id
  const selected = training && selectedId ? findLesson(training, selectedId) : null

  if (!rawTraining) return <Navigate to="/" replace />
  if (!training || !selected) return <Navigate to="/" replace />
  if (!lessonId && firstLesson) {
    return <Navigate to={`/course/${training.id}/${firstLesson.id}`} replace />
  }

  function toggleModule(moduleId) {
    setExpanded((current) => {
      const isOpen = current[moduleId] ?? moduleId === selected.module.id
      return { ...current, [moduleId]: !isOpen }
    })
  }

  function selectLesson(id) {
    const found = findLesson(training, id)
    if (found) {
      setExpanded((current) => ({ ...current, [found.module.id]: true }))
    }
    navigate(`/course/${training.id}/${id}`)
  }

  const { lesson } = selected
  const textAlign = isUr ? 'text-right' : 'text-left'

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-white pb-24 lg:pb-10">
      <div className="mx-auto flex justify-end px-4 pt-4 sm:px-6">
        <LangToggle />
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 lg:py-10">
        <section className="min-w-0">
          <h1 className="text-lg font-semibold text-navy sm:text-xl">{t('courseContent')}</h1>
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            {training.modules.map((module) => {
              const isOpen = expanded[module.id] ?? module.id === selected.module.id
              return (
                <div key={module.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    aria-expanded={isOpen}
                    className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink hover:bg-slate-50 ${textAlign}`}
                  >
                    <span>{module.title}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-mute transition duration-200 ${isOpen ? 'rotate-0' : isUr ? 'rotate-90' : '-rotate-90'}`}
                    />
                  </button>
                  {isOpen && (
                    <ul className="pb-2">
                      {module.lessons.map((item) => {
                        const active = item.id === lesson.id
                        return (
                          <li key={item.id} className="px-2 pb-1">
                            <button
                              type="button"
                              onClick={() => selectLesson(item.id)}
                              className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition ${textAlign} ${
                                active ? 'bg-select font-medium text-navy' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span
                                className={`grid size-4 shrink-0 place-items-center rounded-[4px] border ${
                                  active ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white'
                                }`}
                                aria-hidden="true"
                              >
                                {active ? <Check className="size-3" strokeWidth={3} /> : null}
                              </span>
                              <Gamepad2 className="size-4 shrink-0 text-violet-500" />
                              <span className="min-w-0 leading-snug">{item.title}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="order-first min-w-0 lg:order-none">
          <h2 className={`text-center text-lg font-semibold text-navy sm:text-xl ${lesson.topic ? 'mb-2' : 'mb-5'}`}>
            {lesson.title}
          </h2>
          {lesson.topic && <p className="mb-4 text-center text-sm text-mute sm:mb-5">{lesson.topic}</p>}
          <article className="overflow-hidden rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:rounded-3xl">
            {lesson.poster ? (
              <>
                <img src={lesson.cover} alt="" className="aspect-video w-full object-cover" />
                <div className="bg-slate-900 px-4 py-4 text-white sm:px-6 sm:py-5">
                  <p className="text-center text-xs font-semibold tracking-[0.14em]">{t('whatYoullLearn')}</p>
                  <ul className="mx-auto mt-3 max-w-md space-y-2 text-sm text-slate-100">
                    {lesson.learnings.map((item) => (
                      <li key={item} className={`flex items-start gap-2 ${textAlign}`}>
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="relative min-h-[240px] bg-slate-900 sm:min-h-[320px]">
                <img
                  src={lesson.cover}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-linear-to-b from-slate-950/30 via-slate-950/45 to-slate-950/80" />
                <div className="relative flex min-h-[240px] flex-col items-center px-4 py-8 text-center text-white sm:min-h-[320px] sm:px-12 sm:py-14">
                  <h3 className="max-w-xl text-2xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h3>
                  <p className="mt-3 max-w-xl text-sm text-slate-100 sm:text-base">{lesson.description}</p>
                  <div className={`mt-6 w-full max-w-md rounded-2xl bg-black/45 px-4 py-4 backdrop-blur-sm sm:mt-8 sm:px-6 sm:py-5 ${textAlign}`}>
                    <p className="text-center text-xs font-semibold tracking-[0.14em] text-white">
                      {t('whatYoullLearn')}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-100">
                      {lesson.learnings.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </article>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="flex justify-center pb-[env(safe-area-inset-bottom)]">
              <button
                type="button"
                onClick={() => {
                  if (lesson.game) {
                    navigate(`/play/${training.id}/${lesson.id}`)
                    return
                  }
                  setShowGameNote(true)
                }}
                className="inline-flex min-h-12 w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark lg:w-auto"
              >
                <Play className="size-4 fill-white" />
                {t('launchGame')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {showGameNote && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-note-title"
          onClick={() => setShowGameNote(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h3 id="game-note-title" className="text-lg font-semibold text-navy">
              {t('gameNotAssigned')}
            </h3>
            <p className="mt-2 text-sm text-mute">{t('gameNotAssignedBody')}</p>
            <button
              type="button"
              onClick={() => setShowGameNote(false)}
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {t('okay')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
