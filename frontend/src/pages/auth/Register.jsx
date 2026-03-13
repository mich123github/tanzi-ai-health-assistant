import React, { useState } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try {
      await API.post('/auth/register', { name, email, password });
      nav('/login');
    } catch (err) {
      setErr(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-3">Register</h2>
      {err && <div className="bg-red-100 text-red-700 p-2 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}
