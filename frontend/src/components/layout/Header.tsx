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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <button
          onClick={() => {
            const now = new Date();
            navigate(`/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
          }}
          className="text-xl font-bold text-green-700"
        >
          Studiary
        </button>
        {user && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              {user.nickname}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
