import { Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookmarkButton({ articleId, size = 17, className = '' }) {
  const { saved, interact, isAuthed } = useAuth();
  const navigate = useNavigate();
  const active = saved.has(String(articleId));

  const onClick = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    await interact(articleId, active ? 'UNSAVE' : 'SAVE');
  };

  return (
    <button
      onClick={onClick}
      aria-label={active ? 'Remove bookmark' : 'Save story'}
      aria-pressed={active}
      title={active ? 'Saved' : 'Save'}
      className={`rounded-md p-1.5 transition-colors duration-150 ${
        active ? 'text-accentHover' : 'text-muted hover:bg-surface2 hover:text-paper'
      } ${className}`}
    >
      <Bookmark size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
