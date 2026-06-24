import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { reviewCodeAttempt } from './api/attemptService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace'>('dashboard');
  
  // Dynamic Workspace Tracking
  const [attemptId, setAttemptId] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeProblemTitle, setActiveProblemTitle] = useState<string>('');

  // Auth States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Editor States
  const [code, setCode] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  // 🚀 NEW DYNAMIC PARSER UTILITY
  const handleImportProblem = async (e: any) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Clean up URL to isolate just the string slug descriptor
      // Handles: https://leetcode.com/problems/two-sum/description/ -> "two-sum"
      let slug = urlInput.replace('https://leetcode.com/problems/', '').replace('/description', '').replace('/', '').trim();
      if (!slug) throw new Error("Invalid LeetCode URL structure");

      const displayTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setActiveProblemTitle(displayTitle);

      // Set standard clean code template
      setCode(`// LeetCode Workspace: ${displayTitle}\nfunction solve() {\n    // Write your optimal solution here...\n    \n}`);

      // Register the session dynamically with the backend
      const response = await fetch('http://localhost:8080/api/v1/attempts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ problemSlug: slug }), 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Validation error');

      setAttemptId(data.id); // Captured perfectly!
      setFeedback('');
      setCurrentView('workspace');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize database workspace session');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    setUrlInput('');
  };

  const handleReviewSubmit = async () => {
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const data = await reviewCodeAttempt(attemptId, code, token);
      setFeedback(data.feedback);
    } catch (err: any) {
      setError(err.message || 'Feedback extraction failure');
    } finally {
      setLoading(false);
    }
  };

  // VIEW 1: SIGN IN
  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#F8FAFC', textAlign: 'center', marginBottom: '24px' }}>⚡ LeetCoach AI Login</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Email</label>
              <input type="email" required placeholder="testuser@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#F8FAFC', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Password</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#F8FAFC', boxSizing: 'border-box' }} />
            </div>
            {authError && <div style={{ color: '#FCA5A5', marginBottom: '16px' }}>⚠️ {authError}</div>}
            <button type="submit" disabled={authLoading} style={{ width: '100%', backgroundColor: authLoading ? '#64748B' : '#38BDF8', color: '#0F172A', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: authLoading ? 'not-allowed' : 'pointer' }}>{authLoading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    );
  }

  // VIEW 2: DYNAMIC URL ENGINE DASHBOARD
  if (currentView === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: 'sans-serif' }}>
        <header style={{ height: '55px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: '#1E293B' }}>
          <h1 style={{ fontSize: '18px', margin: 0 }}>⚡ LeetCoach AI <span style={{ color: '#38BDF8', fontSize: '12px' }}>v2.0</span></h1>
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#94A3B8', border: 'none', cursor: 'pointer' }}>Logout</button>
        </header>
        
        <div style={{ maxWidth: '700px', margin: '100px auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: 'bold' }}>Dynamic Problem Importer</h2>
          <p style={{ color: '#94A3B8', marginBottom: '40px', fontSize: '16px' }}>Paste any standard LeetCode problem link below. The platform will automatically provision an isolated environment and hook up the AI review pipeline.</p>
          
          <form onSubmit={handleImportProblem} style={{ display: 'flex', gap: '12px', backgroundColor: '#1E293B', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
            <input 
              type="url" 
              required
              placeholder="https://leetcode.com/problems/three-sum/" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={{ flex: 1, padding: '14px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#F8FAFC', fontSize: '15px' }}
            />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#10B981', color: 'white', padding: '0 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
              {loading ? 'Initializing...' : 'Open Workspace ➔'}
            </button>
          </form>
          {error && <div style={{ color: '#FCA5A5', marginTop: '20px', textAlign: 'left', padding: '12px', backgroundColor: '#7F1D1D', borderRadius: '6px' }}>⚠️ {error}</div>}
        </div>
      </div>
    );
  }

  // VIEW 3: SPLIT-SCREEN WORKSPACE
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: 'sans-serif' }}>
      <header style={{ height: '55px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: '#1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => { setCurrentView('dashboard'); setUrlInput(''); }} style={{ backgroundColor: 'transparent', color: '#38BDF8', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>◀ Back</button>
          <h1 style={{ fontSize: '16px', margin: 0 }}>{activeProblemTitle}</h1>
        </div>
        <button onClick={handleReviewSubmit} disabled={loading} style={{ backgroundColor: loading ? '#64748B' : '#10B981', color: 'white', padding: '8px 18px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? '🔄 Evaluating...' : '🚀 Ask LeetCoach'}
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: '50%', height: '100%', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: '#111827', padding: '8px 16px', fontSize: '12px', color: '#9CA3AF' }}>SOLUTION.JS</div>
          <div style={{ flex: 1 }}>
            <Editor height="100%" theme="vs-dark" defaultLanguage="javascript" value={code} onChange={(value) => setCode(value || '')} options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }} />
          </div>
        </div>

        <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B0F19' }}>
          <div style={{ backgroundColor: '#111827', padding: '8px 16px', fontSize: '12px', color: '#9CA3AF' }}>AI FEEDBACK</div>
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
            {error && <div style={{ color: '#FCA5A5', padding: '12px', backgroundColor: '#7F1D1D', borderRadius: '6px' }}>{error}</div>}
            {loading && <p style={{ color: '#94A3B8' }}>🔄 Querying AI model...</p>}
            {!loading && !feedback && <p style={{ color: '#64748B' }}>Click "Ask LeetCoach" for deep structural code critique.</p>}
            {!loading && feedback && <div style={{ lineHeight: '1.7', color: '#E2E8F0' }}><ReactMarkdown>{feedback}</ReactMarkdown></div>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;