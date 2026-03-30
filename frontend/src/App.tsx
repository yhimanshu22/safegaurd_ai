import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Shield, AlertTriangle, CheckCircle, RotateCcw, 
  Image as ImageIcon, Upload, User, LayoutDashboard,
  Eye, EyeOff, Trash2
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

interface Post {
  id: number;
  content: string;
  image_url?: string;
  status: string;
  toxicity_score: number;
  reason?: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
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
  const [imageUrl, setImageUrl] = useState("");
  const [viewMode, setViewMode] = useState<'user' | 'moderator'>('user');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/posts`);
      setPosts(res.data.reverse());
    } catch (e) {
      console.error("Failed to fetch posts", e);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/metrics`);
      setMetrics(res.data);
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      if (res.data.length === 0) {
        // Create a default user if none exist
        const defaultUser = await axios.post(`${API_BASE}/users`, { username: "demo_user" });
        setUsers([defaultUser.data]);
        setSelectedUser(defaultUser.data.id);
      } else {
        setUsers(res.data);
        setSelectedUser(res.data[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchMetrics();
    fetchUsers();
    const interval = setInterval(() => {
        fetchPosts();
        fetchMetrics();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !imageUrl) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/posts`, { 
        content: newPost,
        image_url: imageUrl || null,
        user_id: selectedUser
      });
      setNewPost("");
      setImageUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPosts();
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (id: number, decision: string) => {
    try {
      await axios.patch(`${API_BASE}/posts/${id}/moderate?correct_label=${decision}`);
      fetchPosts();
      fetchMetrics();
    } catch (e) {
      console.error("Failed to moderate post", e);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (viewMode === 'user') {
      return post.status === 'SAFE';
    } else {
      // Moderator sees everything that needs attention or has been flagged
      return true; // Showing all for dashboard view, but can be customized
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 w-full max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-500" /> SafeGuard AI
          </h1>
          <p className="text-slate-400 mt-1">Multi-Modal Content Moderation Engine</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setViewMode('user')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'user' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <User className="w-4 h-4" /> User Feed
            </button>
            <button 
              onClick={() => setViewMode('moderator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'moderator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Moderator
            </button>
          </div>

          {metrics && viewMode === 'moderator' && (
            <div className="flex gap-6 bg-slate-900/50 p-3 px-6 rounded-xl border border-slate-800 backdrop-blur-sm">
              <MetricItem label="Acc" value={metrics.accuracy} />
              <MetricItem label="Prec" value={metrics.precision} />
              <MetricItem label="Rec" value={metrics.recall} />
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl sticky top-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="text-blue-400 w-5 h-5" /> Create Post
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Post as User</label>
                <select 
                  value={selectedUser || ""}
                  onChange={(e) => setSelectedUser(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Image URL</label>
                <input 
                  type="text"
                  value={imageUrl.startsWith('data:') ? "" : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="relative">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all"
                >
                  <Upload className="w-4 h-4" /> Upload Local Image
                </button>
              </div>

              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 h-32 bg-slate-800">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="bg-red-500 p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] uppercase font-bold text-white">
                    {imageUrl.startsWith('data:') ? 'Local' : 'Link'}
                  </div>
                </div>
              )}

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/10"
              >
                {loading ? "Analyzing Content..." : "Share Post"}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-bold">
              {viewMode === 'user' ? "Recent Activity" : "Moderation Queue"}
            </h2>
            <button onClick={fetchPosts} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <RotateCcw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500">No posts to display in this view.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onOverride={handleOverride} 
                  isModView={viewMode === 'moderator'} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-white">{(value * 100).toFixed(0)}%</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{label}</div>
    </div>
  );
}

function PostCard({ post, onOverride, isModView }: { post: Post, onOverride: (id: number, d: string) => void, isModView: boolean }) {
  const isToxic = post.status === "TOXIC";
  const isFlagged = post.status === "FLAGGED";
  const isPending = post.status === "PENDING";
  const isMisinfo = post.status === "MISINFORMATION";
  const score = Math.max(post.toxicity_score, (post as any).misinformation_score || 0) * 100;

  return (
    <div className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
      isToxic ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30' : 
      isMisinfo ? 'bg-purple-950/20 border-purple-900/50 hover:bg-purple-950/30' :
      isFlagged ? 'bg-amber-950/20 border-amber-900/50' :
      'bg-slate-900 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex flex-col md:flex-row gap-6">
        {post.image_url && (
          <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className={`w-full h-full object-cover transition-all ${isToxic && !isModView ? 'blur-2xl contrast-125' : ''}`} 
            />
            {isToxic && !isModView && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md p-2 rounded-lg text-xs text-white flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Sensitive
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-slate-500 font-mono">
              {new Date(post.created_at).toLocaleString()}
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              isToxic ? 'bg-red-500/20 text-red-400' : 
              isMisinfo ? 'bg-purple-500/20 text-purple-400' :
              isFlagged ? 'bg-amber-500/20 text-amber-400' :
              isPending ? 'bg-slate-800 text-slate-500 animate-pulse' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {post.status}
            </div>
          </div>
          
          <p className="text-lg text-slate-100 mb-4 leading-relaxed">
            {highlightContent(post.content, isToxic)}
          </p>

          {post.reason && isModView && (
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 text-sm text-slate-400 border-l-4 border-l-blue-500 mb-4">
              <span className="text-blue-400 font-semibold mr-2">AI Analysis:</span>
              {post.reason}
            </div>
          )}

          <div className="mt-auto pt-4 flex flex-col sm:flex-row items-center gap-6 border-t border-slate-800/50">
            <div className="w-full">
              <div className="flex justify-between text-[10px] mb-1.5 uppercase font-bold tracking-tighter">
                <span className="text-slate-500 text-xs">Risk Confidence</span>
                <span className={isToxic ? 'text-red-400' : 'text-slate-400'}>{score.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isToxic ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                    isMisinfo ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
            
            {isModView && (
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => onOverride(post.id, 'SAFE')}
                  className="p-2 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-500 hover:text-emerald-400 transition-all"
                  title="Approve"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onOverride(post.id, 'TOXIC')}
                  className="p-2 rounded-lg border border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 text-slate-500 hover:text-red-400 transition-all"
                  title="Flag as Toxic"
                >
                  <AlertTriangle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function highlightContent(text: string, isToxic: boolean) {
  if (!isToxic) return text;
  const spicyWords = ["stupid", "idiot", "kill", "hate", "dumb"];
  const parts = text.split(new RegExp(`(${spicyWords.join('|')})`, 'gi'));
  return parts.map((part, i) => (
    spicyWords.some(w => w.toLowerCase() === part.toLowerCase()) ? 
    <span key={i} className="text-red-400 font-semibold underline decoration-red-500/30 underline-offset-4">{part}</span> : part
  ));
}
