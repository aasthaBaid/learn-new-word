// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const WordCard = ({ wordData }) => {
  if (!wordData) return null;

  const playAudio = () => {
    if (wordData.audio) {
      const audio = new Audio(wordData.audio);
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  };

  // Only show synonyms/antonyms if the array has items.
  const hasSynonyms = wordData.synonyms && wordData.synonyms.length > 0;
  const hasAntonyms = wordData.antonyms && wordData.antonyms.length > 0;

  return (
    <div className="word-card">
      <div className="word-header">
        <h2 className="word-title">{wordData.word}</h2>
        <span className="word-pronunciation">{wordData.pronunciation}</span>
        {wordData.audio && (
          <button onClick={playAudio} className="audio-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
          </button>
        )}
      </div>
      <div className="word-body">
        <p><strong>Meaning:</strong> {wordData.meaning}</p>
        {wordData.example !== "No example sentence available." && <p><strong>Example:</strong> <em>"{wordData.example}"</em></p>}

        {hasSynonyms && <p><strong>Synonyms:</strong> {wordData.synonyms.join(', ')}</p>}
        {hasAntonyms && <p><strong>Antonyms:</strong> {wordData.antonyms.join(', ')}</p>}
      </div>
    </div>
  );
};

function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Effect 1: Fetch the list of available dates on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('https://learn-english-backend-mu.vercel.app/api/history');
        const availableDates = response.data;
        setDates(availableDates);
        if (availableDates.length > 0) {
          setSelectedDate(availableDates[0]); // Select the most recent date by default
        } else {
          setLoading(false); // No dates available
        }
      } catch (err) {
        setError("Could not load word history. Is the backend server running?");
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Effect 2: Fetch words whenever the selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchWordsForDate = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/words/${selectedDate}`);
        setWords(response.data);
        setError(null);
      } catch (err) {
        setError(`Could not load words for ${selectedDate}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchWordsForDate();
  }, [selectedDate]);

  return (
    <div className={`app-container ${theme}`}>
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>History</h3>
        </div>

        {/* This button will only be visible on mobile (controlled by CSS) */}
        <button className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          History ☰
        </button>

        {/* The "open" class is added based on our new state */}
        <ul className={`date-list ${isMenuOpen ? 'open' : ''}`}>
          {dates.length > 0 ? (
            dates.map(date => (
              <li key={date}>
                <button
                  className={`date-button ${date === selectedDate ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setIsMenuOpen(false); // Close menu on selection
                  }}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </button>
              </li>
            ))
          ) : (
            <li className="no-history">No history yet.</li>
          )}
        </ul>
      </nav>

      <main className="main-content">
        <header className="main-header">
          {/* ...your existing header code... */}
        </header>

        {/* ADD THE THEME TOGGLE BUTTON HERE */}
        <div className="theme-toggle-wrapper">
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {loading && <p className="status-message">Loading...</p>}

        {error && <p className="status-message error">{error}</p>}

        {!loading && !error && (
          <div className="word-list-container">
            {words.map((word, index) => (
              <WordCard key={index} wordData={word} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;