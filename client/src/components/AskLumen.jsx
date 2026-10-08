import { useState } from 'react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import api from '../lib/api';

const SUGGESTED = [
  'Explain this in simple language',
  'Why is this important?',
  'Give me the key points',
  'What is the background?',
  'What could happen next?'
];

export default function AskLumen({ articleId }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]); // [{q, a, grounded}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = async q => {
    const text = String(q || '').trim();
    if (!text || loading) return;
    setQuestion('');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/ask', { articleId, question: text });
      setHistory(prev => [...prev, { q: text, a: data.answer, grounded: data.grounded }]);
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 429 ? 'AI service is rate-limited. Try again in a bit.'
        : (err.response?.data?.error || 'Could not answer that. Try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="Ask Lumen" className="mt-6 rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessageCircleQuestion size={15} className="text-accentHover" />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-paper">Ask Lumen</h2>
        <span className="ml-auto text-[11.5px] text-muted">Answers come from this article</span>
      </div>
      <div className="px-4 py-3">
        {history.length > 0 && (
          <div className="mb-3 space-y-3">
            {history.map((h, i) => (
              <div key={i}>
                <p className="text-[13.5px] font-medium text-paper">{h.q}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{h.a}</p>
                {!h.grounded && (
                  <p className="mt-1 text-[12px] text-muted/80">Based on limited information in this article.</p>
                )}
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); ask(question); }}
          className="flex items-center gap-2"
        >
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask a question…"
            aria-label="Ask a question about this article"
            maxLength={500}
            className="h-10 flex-1 rounded-md border border-border bg-ink px-3 text-[13.5px] placeholder:text-muted/70 focus:border-accent/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            aria-label="Send question"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent text-white hover:bg-accentHover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
        {loading && <p className="mt-2 text-[13px] text-muted">Thinking…</p>}
        {error && <p className="mt-2 text-[13px] text-red-400" role="alert">{error}</p>}
        <div className="mt-3">
          <p className="text-[12px] text-muted">Suggested questions:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => ask(s)}
                disabled={loading}
                className="rounded-md border border-border px-2.5 py-1 text-[12.5px] text-muted hover:text-paper disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
