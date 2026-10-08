// AI service: article summarization + grounded Q&A ("Ask Lumen").
//
// Two paths:
//  1. Provider path — OpenAI-compatible chat completions (AI_API_KEY,
//     AI_BASE_URL, AI_MODEL). Key stays server-side, never sent to browser.
//  2. Extractive fallback — frequency-based sentence ranking over the
//     article's own text. Always available, never invents facts.
//
// The fallback is a real summarizer, not canned text: it scores sentences
// by non-stopword term frequency, keeps original order, and derives
// "why it matters" / "what next" only from hedging/future-tense cues in
// the text. Q&A answers strictly from retrieved sentences and says when
// the article lacks the information.
const env = require('../config/env');

const STOP = new Set((
  'a,an,the,and,or,but,if,then,else,for,with,from,that,this,these,those,you,your,' +
  'has,have,had,will,would,can,could,should,was,were,been,are,is,be,been,about,' +
  'into,more,than,its,they,them,their,there,what,when,how,why,who,which,while,' +
  'after,before,between,during,over,under,again,once,here,both,each,few,other,' +
  'some,such,not,no,yes,also,just,like,more,most,say,said,says,according,only,' +
  'all,any,both,each,its,it,as,at,by,on,of,to,in,on,per,via,new,first,last'
).split(','));

const summaryCache = new Map(); // articleId -> { at, payload }
const SUMMARY_TTL_MS = 30 * 60 * 1000;

function providerConfigured() {
  return Boolean(env.aiApiKey);
}

function splitSentences(text = '') {
  return String(text)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/)
    .map(s => s.trim())
    .filter(s => s.length > 25);
}

function wordFreq(text) {
  const freq = new Map();
  text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).forEach(w => {
    if (w.length > 2 && !STOP.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
  });
  return freq;
}

// Score sentences by sum of term frequencies, normalized by length so long
// sentences don't always win. Position bonus: earlier sentences weigh more
// (news puts key facts first).
function rankSentences(sentences, freq) {
  return sentences
    .map((s, i) => {
      const words = s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
      if (!words.length) return { s, score: 0, i };
      const raw = words.reduce((sum, w) => sum + (freq.get(w) || 0), 0);
      const score = (raw / Math.sqrt(words.length)) * (1 + 0.3 * Math.exp(-i / 3));
      return { s, score, i };
    })
    .sort((a, b) => b.score - a.score);
}

function articleText(a) {
  // Ensure the title/description end with terminal punctuation so the
  // sentence splitter doesn't glue them to the following sentence.
  const end = s => {
    s = String(s || '').trim();
    return s && !/[.!?…]$/.test(s) ? s + '.' : s;
  };
  return [end(a.title), end(a.description), a.content].filter(Boolean).join('\n\n');
}

function extractiveSummary(article, maxPoints = 4) {
  const text = articleText(article);
  const sentences = splitSentences(text);
  if (!sentences.length) return null;
  const freq = wordFreq(text);
  const ranked = rankSentences(sentences, freq);
  const top = ranked.slice(0, Math.min(maxPoints, sentences.length)).sort((a, b) => a.i - b.i);
  const keyPoints = top.map(t => t.s);

  const futureRe = /(will|going to|plans? to|expected to|next|upcoming|future|roadmap|by \d{4}|could|may lead)/i;
  const matterCues = sentences.filter(s => /(means|matters|important|impact|affect|change|shift|growth|risk|benefit|cost|why)/i.test(s));
  const nextCues = sentences.filter(s => futureRe.test(s) && !keyPoints.includes(s));

  return {
    keyPoints,
    summary: keyPoints.slice(0, 2).join(' '),
    whyItMatters: matterCues.find(s => !keyPoints.includes(s)) || '',
    whatsNext: nextCues.slice(0, 2).join(' ') || '',
    sentenceCount: sentences.length
  };
}

// Grounded Q&A over the article's own sentences. Retrieves the top
// sentences by token overlap with the question; if nothing overlaps,
// says the information is unavailable instead of inventing an answer.
function extractiveAnswer(article, question) {
  const text = articleText(article);
  const sentences = splitSentences(text);
  if (!sentences.length) {
    return { answer: 'This article does not include enough text to answer that yet.', evidence: [], grounded: false };
  }
  const qTokens = new Set(
    String(question).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w))
  );
  if (!qTokens.size) {
    return { answer: 'Could you rephrase that question?', evidence: [], grounded: false };
  }
  const scored = sentences.map((s, i) => {
    const words = new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/));
    let hit = 0;
    for (const t of qTokens) if (words.has(t)) hit++;
    return { s, hit: hit / qTokens.size, i };
  }).filter(x => x.hit > 0).sort((a, b) => b.hit - a.hit || a.i - b.i);
  if (scored.length) {
    const evidence = scored.slice(0, 2).map(x => x.s);
    return { answer: evidence.join(' '), evidence, grounded: true };
  }
  // Generic questions ("what is this about?", "explain simply", "key
  // points", ...) share no content words with the article. Answer those
  // with the article's top-ranked sentences. Specific questions with no
  // overlap get an honest "not in this article".
  const GENERIC = /what is this|about this|explain|simpl|summary|summar|key points?|main points?|background|why (does|is)|matter|important|happen next|affected/i;
  if (GENERIC.test(String(question))) {
    const freq = wordFreq(text);
    const top = rankSentences(sentences, freq).slice(0, 2).sort((a, b) => a.i - b.i);
    const evidence = top.map(t => t.s);
    if (evidence.length) {
      return { answer: evidence.join(' '), evidence, grounded: true };
    }
  }
  return {
    answer: 'The article does not contain information about that. Try asking about what the story reports, why it matters, or what happens next.',
    evidence: [], grounded: false
  };
}

async function providerChat(messages, maxTokens = 400) {
  const res = await fetch(`${env.aiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.aiApiKey}` },
    body: JSON.stringify({ model: env.aiModel, messages, max_tokens: maxTokens, temperature: 0.3 })
  });
  if (res.status === 429) {
    const err = new Error('AI service rate limit reached. Try again in a bit.');
    err.status = 429;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`AI service request failed (HTTP ${res.status}).`);
    err.status = 502;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  const text = data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content : '';
  if (!text || !text.trim()) throw Object.assign(new Error('AI service returned an empty response.'), { status: 502 });
  return text.trim();
}

function parseSummaryText(text) {
  // Best-effort parse of provider output into the UI shape.
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const keyPoints = lines.filter(l => /^([•\-*]|\d+[.)])/.test(l)).map(l => l.replace(/^([•\-*]|\d+[.)])\s*/, '')).slice(0, 5);
  const grab = label => {
    const i = lines.findIndex(l => l.toLowerCase().startsWith(label));
    return i >= 0 ? lines.slice(i, i + 3).join(' ').replace(new RegExp(`^${label}\\s*:?\\s*`, 'i'), '') : '';
  };
  return {
    keyPoints: keyPoints.length ? keyPoints : lines.slice(0, 4),
    summary: lines[0] || text.slice(0, 280),
    whyItMatters: grab('why it matters'),
    whatsNext: grab('what') || grab('next'),
    sentenceCount: null
  };
}

async function summarizeArticle(article) {
  const key = String(article._id);
  const hit = summaryCache.get(key);
  if (hit && Date.now() - hit.at < SUMMARY_TTL_MS) return { ...hit.payload, cached: true };

  let payload;
  if (providerConfigured()) {
    try {
      const text = articleText(article).slice(0, 12000);
      const out = await providerChat([
        { role: 'system', content: 'Summarize the news article below as JSON with keys: keyPoints (array of 3-5 short strings), summary (2 sentences), whyItMatters (1-2 sentences), whatsNext (1-2 sentences, empty string if unclear). Base everything strictly on the article; do not invent facts.' },
        { role: 'user', content: `Title: ${article.title}\n\n${text}` }
      ]);
      let parsed;
      try { parsed = JSON.parse(out); } catch { parsed = parseSummaryText(out); }
      payload = {
        keyPoints: (parsed.keyPoints || []).slice(0, 5),
        summary: parsed.summary || '',
        whyItMatters: parsed.whyItMatters || '',
        whatsNext: parsed.whatsNext || '',
        source: 'ai', model: env.aiModel, cached: false
      };
    } catch (err) {
      if (err.status === 429 || err.status === 502) throw err;
      payload = null; // provider misbehaving -> fall through to extractive
    }
  }
  if (!payload) {
    const ext = extractiveSummary(article);
    if (!ext) {
      const err = new Error('This article has too little text to summarize.');
      err.status = 422;
      throw err;
    }
    payload = { ...ext, source: 'extractive', model: null, cached: false };
  }
  summaryCache.set(key, { at: Date.now(), payload });
  return payload;
}

async function answerQuestion(article, question) {
  const q = String(question || '').trim().slice(0, 500);
  if (q.length < 3) {
    const err = new Error('Please ask a fuller question.');
    err.status = 400;
    throw err;
  }
  if (providerConfigured()) {
    try {
      const text = articleText(article).slice(0, 12000);
      const out = await providerChat([
        { role: 'system', content: 'Answer the question strictly from the article below. If the article does not contain the answer, say so plainly and suggest what it does cover. Keep it under 150 words.' },
        { role: 'user', content: `Article — ${article.title}\n\n${text}\n\nQuestion: ${q}` }
      ], 300);
      return { answer: out, evidence: [], grounded: true, source: 'ai', model: env.aiModel };
    } catch (err) {
      if (err.status === 429 || err.status === 502) throw err;
      // fall through to extractive
    }
  }
  const ext = extractiveAnswer(article, q);
  return { ...ext, source: 'extractive', model: null };
}

module.exports = {
  providerConfigured,
  summarizeArticle,
  answerQuestion,
  extractiveSummary,
  extractiveAnswer
};
