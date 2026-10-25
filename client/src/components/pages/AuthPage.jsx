import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, err } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';

export function AuthPage() {
  const { login, notify } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState('user');
  const [showRegistration, setShowRegistration] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const updateForm = (key) => (event) => {
    setForm((previous) => ({ ...previous, [key]: event.target.value }));
  };

  const isRegistration = showRegistration && role === 'user';

  const handleRolePick = (selectedRole) => {
    setRole(selectedRole);
    setShowRegistration(false);
  };

  const submitAuthForm = async (event) => {
    event.preventDefault();

    try {
      const endpoint = '/auth/' + (isRegistration ? 'register' : 'login');
      const response = await api.post(endpoint, { ...form, role });
      login(response.data);
      navigate(response.data.user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      notify(err(error), true);
    }
  };

  return (
    <form className="panel" style={{ maxWidth: 400, margin: '40px auto' }} onSubmit={submitAuthForm}>
      <div className="tabs" role="tablist">
        {['user', 'admin'].map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={role === option}
            className={role === option ? '' : 'ghost'}
            onClick={() => handleRolePick(option)}
          >
            {option === 'user' ? 'User login' : 'Admin login'}
          </button>
        ))}
      </div>

      <h1>{isRegistration ? 'Create account' : role === 'admin' ? 'Admin log in' : 'Log in'}</h1>

      {isRegistration && (
        <>
          <label>
            Name
            <input required value={form.name} onChange={updateForm('name')} />
          </label>

          <label>
            Phone
            <input value={form.phone} onChange={updateForm('phone')} />
          </label>
        </>
      )}

      <label>
        Email
        <input type="email" required value={form.email} onChange={updateForm('email')} />
      </label>

      <label>
        Password
        <input type="password" required minLength={6} value={form.password} onChange={updateForm('password')} />
      </label>

      <div className="row">
        <button type="submit">
          {isRegistration ? 'Create account' : role === 'admin' ? 'Log in as admin' : 'Log in'}
        </button>

        {role === 'user' && (
          <button type="button" className="ghost" onClick={() => setShowRegistration(!showRegistration)}>
            {showRegistration ? 'I have an account' : 'New here? Sign up'}
          </button>
        )}
      </div>
    </form>
  );
}
