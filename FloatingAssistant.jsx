// src/components/FloatingAssistant.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api'; // optional: will be used to fetch /api/auth/me
// Make sure bootstrap-icons CSS is loaded globally (see instructions below)

export default function FloatingAssistant() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [statusText, setStatusText] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // detect support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (ev) => {
      const spoken = ev.results[0][0].transcript.trim();
      console.log('Assistant heard:', spoken);
      setStatusText(`Heard: "${spoken}"`);
      handleCommand(spoken);
    };
    r.onend = () => {
      setListening(false);
      setStatusText('');
    };
    r.onerror = (err) => {
      console.error('Recognition error', err);
      setListening(false);
      setStatusText('Voice error');
      speak('Voice recognition error. Try again.');
    };
    recognitionRef.current = r;
    // cleanup on unmount
    return () => {
      try { recognitionRef.current && recognitionRef.current.stop(); } catch {}
    };
  }, []);

  function speak(text) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US';
    synthRef.current.speak(u);
  }

  function startListening() {
    if (!recognitionRef.current) {
      setSupported(false);
      speak('Voice search not supported in this browser.');
      return;
    }
    try {
      recognitionRef.current.start();
      setListening(true);
      setStatusText('Listening...');
      speak('Listening');
    } catch (e) {
      console.error('start err', e);
    }
  }

  function stopListening() {
    try {
      recognitionRef.current && recognitionRef.current.stop();
    } catch (e) {}
    setListening(false);
    setStatusText('');
  }

  async function handleCommand(text) {
    // normalize
    const t = text.toLowerCase();

    // common commands:
    // - "search tomatoes" => navigate to /dashboard/user?q=tomatoes
    // - "go to login" / "open login" / "open register" / "go to register"
    // - "open dashboard" / "go to dashboard"
    // - "show profile" => fetch /api/auth/me and speak details
    // - "open cart" => navigate('/cart') (if you have cart route)
    // - "buy <product name>" => try to search product
    try {
      if (/^(search|find)\s+(.+)$/.test(t)) {
        const q = t.replace(/^(search|find)\s+/, '').trim();
        speak(`Searching for ${q}`);
        // navigate to dashboard with query param; your dashboard should pick this up
        navigate(`/dashboard/user?q=${encodeURIComponent(q)}`);
        return;
      }

      if (/(go to|open)\s+(login|sign in)/.test(t)) {
        speak('Opening login');
        navigate('/login');
        return;
      }

      if (/(go to|open)\s+(register|sign up)/.test(t)) {
        speak('Opening register');
        navigate('/register');
        return;
      }

      if (/(go to|open)\s+(dashboard|home)/.test(t)) {
        speak('Opening dashboard');
        navigate('/dashboard/user');
        return;
      }

      if (/(show|open)\s+(cart|my cart)/.test(t)) {
        speak('Opening your cart');
        navigate('/cart');
        return;
      }

      if (/^(show|what is|tell me)\s+(my|the)?\s*profile/.test(t) || t === 'show profile') {
        // fetch /api/auth/me and speak
        speak('Fetching profile');
        try {
          const res = await api.get('/api/auth/me');
          const user = res.data?.user;
          if (user) {
            const msg = `Your name is ${user.name || user.email || 'user'}. You have ${user.coins || 0} coins and balance rupees ${user.balance || 0}.`;
            speak(msg);
          } else {
            speak('Not signed in.');
            navigate('/login');
          }
        } catch (e) {
          console.error('profile fetch', e);
          speak('Could not fetch profile. Please login.');
          navigate('/login');
        }
        return;
      }

      if (/^buy\s+(.+)$/.test(t)) {
        // go to dashboard and search for product term
        const q = t.replace(/^buy\s+/, '').trim();
        speak(`Searching and showing buy options for ${q}`);
        navigate(`/dashboard/user?q=${encodeURIComponent(q)}`);
        return;
      }

      // Fallback:
      speak("Sorry, I didn't understand. Try: search <term>, go to login, open register, show profile, open cart, buy <item>.");
    } catch (e) {
      console.error('handleCommand error', e);
      speak('An error occurred while handling your command.');
    }
  }

  // toggle handler for button
  const onToggle = () => {
    if (!supported) {
      speak('Voice assistant not supported in this browser.');
      return;
    }
    if (listening) stopListening();
    else startListening();
  };

  // button title shows status; visible on all pages
  return (
    <>
      {/* Floating circular button */}
      <button
        onClick={onToggle}
        title={listening ? 'Stop assistant' : 'Open assistant'}
        aria-label="Floating assistant"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 1060,
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: listening ? '#e74c3c' : '#0d6efd',
          color: 'white',
          border: 'none',
          boxShadow: '0 6px 18px rgba(13,110,253,0.25)',
          cursor: 'pointer',
        }}
      >
        <i className={listening ? 'bi bi-mic-mute-fill' : 'bi bi-robot'} style={{ fontSize: 26 }} />
      </button>

      {/* small status bubble above button */}
      {statusText && (
        <div style={{
          position: 'fixed',
          right: 18,
          bottom: 96,
          zIndex: 1060,
          background: '#111827',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
        }}>
          {statusText}
        </div>
      )}
    </>
  );
}
