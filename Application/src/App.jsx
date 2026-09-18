import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { LanguageProvider } from './i18n/LanguageContext'
import CourseContent from './pages/CourseContent'
import PlayGame from './pages/PlayGame'
import TrainingCatalog from './pages/TrainingCatalog'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="play/:courseId/:lessonId" element={<PlayGame />} />
          <Route element={<Layout />}>
            <Route index element={<TrainingCatalog />} />
            <Route path="course/:courseId" element={<CourseContent />} />
            <Route path="course/:courseId/:lessonId" element={<CourseContent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
