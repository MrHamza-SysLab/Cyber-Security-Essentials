import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { findLesson, getTraining } from '../data/trainings'
import { GAMES } from '../games/registry'

export default function PlayGame() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const training = getTraining(courseId)
  const selected = training ? findLesson(training, lessonId) : null
  const Game = selected?.lesson.game ? GAMES[selected.lesson.game] : null

  if (!training || !selected) return <Navigate to="/" replace />
  if (!Game) return <Navigate to={`/course/${courseId}/${lessonId}`} replace />

  return <Game onExit={() => navigate(`/course/${courseId}/${lessonId}`)} />
}
