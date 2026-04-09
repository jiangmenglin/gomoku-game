import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { hashPassword } from '../utils/crypto';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const hashedPassword = await hashPassword(password);
      const res = await axios.post('http://localhost:4000/api/auth/login', { username, password: hashedPassword });
      login(res.data.token, res.data.user);
      navigate('/room');
    } catch(err) {
      setError(err.response?.data?.message || '登录失败');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🎮 五子棋对战</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" required />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" required />
          </div>
          <button type="submit" className="btn btn-primary">登录</button>
        </form>
        <div className="auth-link">还没有账号？ <span onClick={() => navigate('/register')}>立即注册</span></div>
      </div>
    </div>
  );
}