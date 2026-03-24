/* eslint-disable no-irregular-whitespace */
import React, { useState } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  async function submit(e){
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch (err) {
      setErr(err.response?.data?.message || 'Login failed');
    }
  }
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-3">Login</h2>
      {err && <div className="bg-red-100 text-red-700 p-2 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input value={email} onChange={e=>setEmail(e.target.value)}
               placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)}
               placeholder="Password" type="password" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Login</button>
          <a href="/register" className="self-center text-sm text-teal-700">Register</a>
        </div>
      </form>
    </div>
  );
}