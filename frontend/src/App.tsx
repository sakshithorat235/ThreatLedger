import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';
const THREATS_API = `${API_BASE}/threats`;
const AUTH_API = `${API_BASE}`;

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type AuthMode = 'login' | 'register';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Threat = {
  _id: string;
  type: string;
  indicator: string;
  severity: Severity;
  status: string;
  description: string;
  createdAt: string;
};

function App() {
  // Authentication state
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('threatledger_user');
      const savedToken = localStorage.getItem('threatledger_token');

      if (savedUser && savedToken) {
        return JSON.parse(savedUser) as AuthUser;
      }
    } catch {
      localStorage.removeItem('threatledger_user');
      localStorage.removeItem('threatledger_token');
    }

    return null;
  });

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Dashboard state
  const [threats, setThreats] = useState<Threat[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // New threat form
  const [type, setType] = useState('Malware');
  const [indicator, setIndicator] = useState('');
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [description, setDescription] = useState('');

  // =====================================
  // LOGIN / REGISTRATION
  // =====================================

  async function handleAuthSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setAuthError('');
    setAuthMessage('');

    if (!authEmail.trim() || !authPassword) {
      setAuthError('Email and password are required.');
      return;
    }

    if (authMode === 'register' && !authName.trim()) {
      setAuthError('Please enter your name.');
      return;
    }

    if (authMode === 'register' && authPassword.length < 8) {
      setAuthError('Password must contain at least 8 characters.');
      return;