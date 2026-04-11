import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) errors.email = '이메일을 입력해주세요.';
    if (!password) errors.password = '비밀번호를 입력해주세요.';
    else if (password.length < 8)
      errors.password = '비밀번호는 8자 이상이어야 합니다.';
    else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
      errors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';

    if (password !== passwordConfirm)
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

    if (!nickname) errors.nickname = '닉네임을 입력해주세요.';
    else if (nickname.length > 50)
      errors.nickname = '닉네임은 50자 이하여야 합니다.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({ email, password, nickname });
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosErr.response?.data?.detail || '회원가입에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-green-700">
          Studiary
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-800">회원가입</h2>

          {error && <ErrorMessage message={error} />}

          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
            data-testid="register-email"
          />
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
            placeholder="영문+숫자 포함 8자 이상"
            data-testid="register-password"
          />
          <Input
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={fieldErrors.passwordConfirm}
            required
            autoComplete="new-password"
            data-testid="register-password-confirm"
          />
          <Input
            label="닉네임"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={fieldErrors.nickname}
            required
            maxLength={50}
            data-testid="register-nickname"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '가입 중...' : '회원가입'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-green-600 hover:underline">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
