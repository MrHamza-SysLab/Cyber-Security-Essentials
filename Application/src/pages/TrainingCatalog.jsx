import { Bookmark, CheckCircle2, GraduationCap, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GRADES, TRAININGS } from '../data/trainings'

export default function TrainingCatalog() {
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('')

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TRAININGS.filter((course) => {
      const matchesQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.org.toLowerCase().includes(q)
      const matchesGrade = !grade || course.grade === grade
      return matchesQuery && matchesGrade
    })
  }, [query, grade])

  function onSearch(event) {
    event.preventDefault()
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-linear-to-b from-page to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-4xl">
            Game-Based Training
          </h1>
          <p className="mt-2 text-sm text-mute sm:text-base">
            Explore interactive game-based courses to learn through play
          </p>
        </div>

        <form
          onSubmit={onSearch}
          className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label className="sr-only" htmlFor="training-search">
            Search training courses
          </label>
          <input
            id="training-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search training courses..."
            className="h-11 min-h-11 flex-1 rounded-full border border-slate-200 bg-white px-5 text-sm text-ink shadow-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="inline-flex h-11 min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-800 px-6 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <Search className="size-4" />
            Search
          </button>
          <label className="sr-only" htmlFor="grade-filter">
            Filter by grade
          </label>
          <select
            id="grade-filter"
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="h-11 min-h-11 cursor-pointer rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 shadow-sm"
          >
            <option value="">Filter by Grade</option>
            {GRADES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </form>

        {courses.length === 0 ? (
          <p className="mt-16 text-center text-sm text-mute">No training courses match your search.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"
              >
                <div className="relative">
                  <img
                    src={course.image}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Bookmark ${course.title}`}
                    className="absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:text-brand"
                  >
                    <Bookmark className="size-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h2 className="text-base font-semibold text-ink">{course.title}</h2>
                  <p className="mt-1 text-sm text-mute">{course.org}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-brand">
                      <GraduationCap className="size-3.5" />
                      professional
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                      <CheckCircle2 className="size-3.5" />
                      {course.grade}
                    </span>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="mt-4 inline-flex h-11 min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Course Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
