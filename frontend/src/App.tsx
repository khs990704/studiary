import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import StudyPage from './pages/StudyPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Header from './components/layout/Header';
import { useAuth } from './hooks/useAuth';

export default function App() {
  useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
          element={
            <>
              <Header />
              <StudyPage />
            </>
          }
        />
      </Route>
    </Routes>
  );
}
