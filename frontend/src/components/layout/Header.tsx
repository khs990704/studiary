import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  /** When set, shows date as green title with back chevron instead of "Studiary" logo */
  studyDate?: string;
}

export default function Header({ studyDate }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4">
      <div className="flex items-center gap-4">
        {studyDate ? (
          <button
            onClick={() => navigate(-1)}
            className="font-headline tracking-[-0.02em] font-bold text-xl text-[#7bdb85] flex items-center hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined mr-2 text-sm">chevron_left</span>
            {studyDate}
          </button>
        ) : (
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
        )}
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#e5e2e1]/80 hidden sm:inline">{user.nickname}</span>
          <button
            onClick={handleLogout}
            className="bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-white/5"
            aria-label="로그아웃"
            title="로그아웃"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
