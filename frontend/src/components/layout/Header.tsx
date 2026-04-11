import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <button
          onClick={() => {
            const now = new Date();
            navigate(`/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
            window.scrollTo(0, 0);
          }}
          className="text-lg font-bold tracking-tight text-green-700 transition-colors hover:text-green-600"
        >
          Studiary
        </button>
        {user && (
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
              {user.nickname}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
