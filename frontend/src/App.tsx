import { Routes, Route, useParams } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import StudyPage from './pages/StudyPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Header from './components/layout/Header';
import { useAuth } from './hooks/useAuth';

function StudyPageWithHeader() {
  const { date } = useParams<{ date: string }>();
  return (
    <>
      <Header studyDate={date} />
      <StudyPage />
    </>
  );
}

export default function App() {
  useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <>
              <Header />
              <MainPage />
            </>
          }
        />
        <Route
          path="/study/:date"
          element={<StudyPageWithHeader />}
        />
      </Route>
    </Routes>
  );
}
