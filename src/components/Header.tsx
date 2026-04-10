import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, Home } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="w-6 h-6 text-[#c8a45a]" />
          Ga Bible Study
        </Link>
        <nav className="flex gap-4">
          <Link to="/" className="flex items-center gap-1 hover:text-[#c8a45a] transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link to="/reader" className="flex items-center gap-1 hover:text-[#c8a45a] transition-colors">
            <BookOpen className="w-4 h-4" /> Reader
          </Link>
          <Link to="/study" className="flex items-center gap-1 hover:text-[#c8a45a] transition-colors">
            <BookMarked className="w-4 h-4" /> Study
          </Link>
        </nav>
      </div>
    </header>
  );
}
