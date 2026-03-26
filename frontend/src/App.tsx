import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';

const API_BASE = "http://localhost:8000";

interface Post {
  id: number;
  content: string;
  status: string;
  toxicity_score: number;
  reason?: string;
}

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  total_samples: number;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const res = await axios.get(`${API_BASE}/posts`);
    setPosts(res.data.reverse());
  };

  const fetchMetrics = async () => {
    const res = await axios.get(`${API_BASE}/metrics`);
    setMetrics(res.data);
  };

  useEffect(() => {
    fetchPosts();
    fetchMetrics();
    const interval = setInterval(() => {
        fetchPosts();
        fetchMetrics();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/posts`, { content: newPost });
      setNewPost("");
      fetchPosts();
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (id: number, decision: string) => {
    await axios.patch(`${API_BASE}/posts/${id}/moderate?correct_label=${decision}`);
    fetchPosts();
    fetchMetrics();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 w-full">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SafeGuard AI
          </h1>
          <p className="text-slate-400">Content Moderation & Analytics Engine</p>
        </div>
        
        {metrics && (
          <div className="flex gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <MetricItem label="Accuracy" value={metrics.accuracy} />
            <MetricItem label="Precision" value={metrics.precision} />
            <MetricItem label="Recall" value={metrics.recall} />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Post */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="text-blue-400 w-5 h-5" /> New Post
            </h2>
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? (Test with something 'killer' or 'insulting')"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                {loading ? "Analyzing..." : "Post & Moderate"}
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Feed & Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-bold">Activity Feed</h2>
            <button onClick={fetchPosts} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <RotateCcw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onOverride={handleOverride} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="text-center px-4">
      <div className="text-2xl font-bold text-white">{(value * 100).toFixed(0)}%</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function PostCard({ post, onOverride }: { post: Post, onOverride: (id: number, d: string) => void }) {
  const isToxic = post.status === "TOXIC";
  const isPending = post.status === "PENDING";
  const score = post.toxicity_score * 100;

  return (
    <div className={`p-6 rounded-2xl border transition-all ${isToxic ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-lg text-slate-100 mb-2 leading-relaxed">
            {highlightContent(post.content, isToxic)}
          </p>
          {post.reason && (
            <p className="text-sm text-slate-500 italic">"{post.reason}"</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {isPending ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-slate-800 text-slate-400 animate-pulse">
              PENDING
            </span>
          ) : (
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${isToxic ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {isToxic ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              {post.status}
            </span>
          )}
        </div>
      </div>

      {!isPending && (
        <div className="mt-6 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium caps">Toxicity Confidence</span>
              <span className={isToxic ? 'text-red-400' : 'text-slate-400'}>{score.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isToxic ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onOverride(post.id, 'SAFE')}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-slate-500 hover:text-emerald-400"
            >
              Approve
            </button>
            <button 
              onClick={() => onOverride(post.id, 'TOXIC')}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-slate-500 hover:text-red-400"
            >
              Flag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function highlightContent(text: string, isToxic: boolean) {
  if (!isToxic) return text;
  // Simple highlight for common toxic words (illustrative)
  const spicyWords = ["stupid", "idiot", "kill", "hate", "dumb"];
  const parts = text.split(new RegExp(`(${spicyWords.join('|')})`, 'gi'));
  return parts.map((part, i) => (
    spicyWords.some(w => w.toLowerCase() === part.toLowerCase()) ? 
    <span key={i} className="text-red-400 font-semibold underline decoration-red-500/30 underline-offset-4">{part}</span> : part
  ));
}
