import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      navigate('/', { replace: true });
    }
  }, [searchParams, setToken, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131313] px-4">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#44a354]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[360px] animate-slide-up">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#44a354] shadow-lg shadow-[#44a354]/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002107]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-[#e5e2e1]">Studiary</h1>
            <p className="mt-1 text-sm text-[#becaba]">나만의 공부 기록을 시작하세요</p>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-xl bg-[#1c1b1b] border border-[#3f4a3e]/60">
          <div className="p-6">
            <h2 className="text-base font-semibold text-[#e5e2e1]">시작하기</h2>
            <p className="mt-1 text-sm text-[#becaba]">Google 계정으로 간편하게 로그인하세요</p>

            <button
              onClick={handleGoogleLogin}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#3f4a3e] bg-[#2a2a2a] px-4 py-3 text-sm font-medium text-[#e5e2e1] transition-all duration-150 hover:bg-[#353534] active:scale-[0.99]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google로 계속하기
            </button>
          </div>

          <div className="border-t border-[#3f4a3e]/60 bg-[#1c1b1b] px-6 py-4">
            <p className="text-center text-xs text-[#becaba]/60">
              로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: '📊', label: '학습 히트맵' },
            { icon: '⏱️', label: '집중 타이머' },
            { icon: '🤖', label: 'AI 피드백' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1c1b1b] px-2 py-3 text-center border border-[#3f4a3e]/40">
              <span className="text-xl">{f.icon}</span>
              <span className="text-xs font-medium text-[#becaba]">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
