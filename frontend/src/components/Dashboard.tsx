import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, CheckCircle, RotateCcw, 
  Image as ImageIcon, Upload, User as UserIcon, LayoutDashboard,
  EyeOff, Trash2, Send, Search, Zap
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

// Removed unused User interface

// Removed unused Metrics interface

interface DashboardProps {
  token: string | null;
}

export default function Dashboard({ token }: DashboardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [viewMode, setViewMode] = useState<'user' | 'moderator'>('user');
  const [users, setUsers] = useState<any[]>([]);
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
      // Keeping fetch for potential local dashboard needs, but removing the setMetrics call 
      // if we removed the state. Wait, better to keep the state for now to avoid more errors.
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  };

  // Removed legacy fetchUsers

  useEffect(() => {
    fetchPosts();
    fetchMetrics();
    // Removed legacy fetchUsers - handled by auth now
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
    if (!token) {
        alert("Please login to post content.");
        return;
    }
    if (!newPost.trim() && !imageUrl) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/posts`, { 
        content: newPost,
        image_url: imageUrl || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPost("");
      setImageUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (id: number, decision: string) => {
    try {
      await axios.patch(`${API_BASE}/posts/${id}/moderate?correct_label=${decision}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
      fetchMetrics();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to moderate post. Are you a moderator?");
    }
  };

  const filteredPosts = posts.filter(post => {
    if (viewMode === 'user') {
      return post.status === 'SAFE';
    } else {
      return true;
    }
  });

  return (
    <div id="demo" className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <div className="glass rounded-[32px] p-8 border-none shadow-xl shadow-gray-200/50 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="text-[#f55064] w-5 h-5" /> Live Sandbox
            </h3>
            
            <form onSubmit={handleCreatePost} className="space-y-6">
              {/* User selection removed - automatically set to logged in user */}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Content</label>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#f55064]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                  <div className="flex-1 relative">
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
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:border-[#f55064] hover:text-[#f55064] transition-all"
                    >
                      <Upload className="w-5 h-5" /> Local
                    </button>
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={imageUrl.startsWith('data:') ? "" : imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Image URL"
                      className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#f55064]/20 outline-none"
                    />
                  </div>
              </div>

              {imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-100 h-40 bg-gray-50">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="bg-[#f55064] p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={loading}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {loading ? "Analyzing..." : "Post & Moderating"}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="lg:w-2/3 space-y-8">
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <div className="flex p-1">
              <button 
                onClick={() => setViewMode('user')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'user' ? 'bg-white text-[#f55064] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <UserIcon className="w-4 h-4" /> User Feed
              </button>
              <button 
                onClick={() => setViewMode('moderator')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'moderator' ? 'bg-white text-[#f55064] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Moderator
              </button>
            </div>
            <button onClick={fetchPosts} className="mr-4 p-3 hover:bg-white rounded-xl transition-all text-gray-400">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-32 glass rounded-[32px] border-dashed border-2 border-gray-100">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No activity to show</p>
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

function PostCard({ post, onOverride, isModView }: { post: Post, onOverride: (id: number, d: string) => void, isModView: boolean }) {
  const isToxic = post.status === "TOXIC";
  const isFlagged = post.status === "FLAGGED";
  const isPending = post.status === "PENDING";
  const isMisinfo = post.status === "MISINFORMATION";
  const score = Math.max(post.toxicity_score, (post as any).misinformation_score || 0) * 100;

  return (
    <div className={`group glass rounded-[32px] p-8 border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative ${
      isToxic ? 'border-l-4 border-l-[#f55064]' : 
      isMisinfo ? 'border-l-4 border-l-purple-500' :
      'border-l-4 border-l-emerald-500'
    }`}>
      <div className="flex flex-col md:flex-row gap-8">
        {post.image_url && (
          <div className="w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-gray-50 shrink-0 relative">
            <img 
              src={post.image_url} 
              alt="Post" 
              className={`w-full h-full object-cover transition-all ${isToxic && !isModView ? 'blur-3xl' : ''}`} 
            />
            {isToxic && !isModView && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md">
                <EyeOff className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isToxic ? 'bg-red-50 text-red-500' : 
              isMisinfo ? 'bg-purple-50 text-purple-500' :
              isFlagged ? 'bg-amber-50 text-amber-500' :
              isPending ? 'bg-gray-100 text-gray-400 animate-pulse' :
              'bg-emerald-50 text-emerald-500'
            }`}>
              {post.status}
            </div>
          </div>
          
          <p className="text-xl text-gray-900 leading-relaxed font-medium mb-6">
            {highlightContent(post.content, isToxic)}
          </p>

          {post.reason && isModView && (
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 mb-6 flex gap-4">
              <Zap className="w-5 h-5 text-[#f55064] shrink-0" />
              <div>
                <span className="text-[#f55064] font-black uppercase text-[10px] tracking-widest block mb-1">AI Verdict</span>
                {post.reason}
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center gap-6 pt-6 border-t border-gray-50">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Risk Confidence</span>
                <span className={`text-[10px] font-black ${isToxic ? 'text-red-500' : 'text-gray-900'}`}>{score.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isToxic ? 'bg-[#f55064]' : 
                    isMisinfo ? 'bg-purple-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
            
            {isModView && (
              <div className="flex gap-2">
                <button 
                  onClick={() => onOverride(post.id, 'SAFE')}
                  className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  <CheckCircle className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => onOverride(post.id, 'TOXIC')}
                  className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-[#f55064] hover:text-white transition-all shadow-sm"
                >
                  <AlertTriangle className="w-6 h-6" />
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
    <span key={i} className="text-[#f55064] font-black underline decoration-red-200 underline-offset-8 decoration-4">{part}</span> : part
  ));
}
