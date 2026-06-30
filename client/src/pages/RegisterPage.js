import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password !== confirmPwd) { setError('两次密码不一致'); return; }
    try {
      await api.post('/auth/register', { username, password });
      setSuccess('注册成功，正在跳转...');
      setTimeout(() => navigate('/login'), 1500);
    } catch(err) {
      setError(err.response?.data?.message || '注册失败');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>📝 注册账号</h2>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" required />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少4位" required />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="再次输入密码" required />
          </div>
          <button type="submit" className="btn btn-primary">注册</button>
        </form>
        <div className="auth-link">已有账号？ <span onClick={() => navigate('/login')}>返回登录</span></div>
      </div>
    </div>
  );
}