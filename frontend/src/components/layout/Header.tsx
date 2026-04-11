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
    <header className="fixed top-0 w-full z-50 bg-[#131313] flex justify-between items-center px-6 h-16 font-headline tracking-tight border-b border-[#3f4a3e]/40">
      <button
        onClick={() => {
          const now = new Date();
          navigate(`/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
          window.scrollTo(0, 0);
        }}
        className="text-xl font-bold tracking-tight text-[#e5e2e1] transition-opacity hover:opacity-70"
      >
        Studiary
      </button>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#becaba]">{user.nickname}</span>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-[#becaba] opacity-60 hover:opacity-100 transition-opacity"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
