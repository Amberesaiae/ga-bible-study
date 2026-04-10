import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import HomePage from './components/HomePage';
import ReaderPage from './components/ReaderPage';
import StudyPage from './components/StudyPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reader" element={<ReaderPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/study/:book/:chapter" element={<ReaderPage />} />
        </Routes>
      </main>
      <AudioPlayer />
    </div>
  );
}
