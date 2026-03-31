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
  username: string; // Required now
}

// Relative time helper
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  });
}

interface DashboardProps {
  token: string | null;
  userRole: string | null;
}

export default function Dashboard({ token, userRole }: DashboardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  // ... (rest of the component state and effects)
  const [newPost, setNewPost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [viewMode, setViewMode] = useState<'user' | 'moderator'>(userRole === 'moderator' ? 'moderator' : 'user');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/posts`);
      setPosts(res.data); // data is already reversed by backend or by state? actually backend returns sorted.
    } catch (e) {
      console.error("Failed to fetch posts", e);
    }
  };

  const fetchMetrics = async () => {
    try {
      await axios.get(`${API_BASE}/metrics`);
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  };

  useEffect(() => {
    setViewMode(userRole === 'moderator' ? 'moderator' : 'user');
  }, [userRole]);

  useEffect(() => {
    fetchPosts();
    fetchMetrics();
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
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to moderate post.");
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
          {userRole === 'moderator' && (
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
          )}

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
  const score = Math.max(post.toxicity_score || 0, (post as any).misinformation_score || 0) * 100;

  return (
    <div className={`group glass rounded-[24px] p-6 border-none shadow-sm hover:shadow-lg transition-all duration-300 relative ${
      isToxic ? 'border-l-4 border-l-[#f55064]' : 
      isMisinfo ? 'border-l-4 border-l-purple-500' :
      'border-l-4 border-l-emerald-500'
    }`}>
      <div className="flex gap-4">
        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
          <UserIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header: Name, Handle, Time, Badge */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">
                {post.username || `User ${post.id}`}
              </span>
              <span className="text-gray-400 text-xs">
                @{(post.username || 'user').toLowerCase().replace(/\s+/g, '')}
              </span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-gray-400 text-xs">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>
            
            <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
              isToxic ? 'bg-red-50 text-red-500' : 
              isMisinfo ? 'bg-purple-50 text-purple-500' :
              isFlagged ? 'bg-amber-50 text-amber-500' :
              isPending ? 'bg-gray-100 text-gray-400 animate-pulse' :
              'bg-emerald-50 text-emerald-500'
            }`}>
              {post.status}
            </div>
          </div>
          
          {/* Content */}
          {(() => {
            const cleanContent = post.content?.replace(/^Kaggle Dataset Image:.*?\.(jpg|png|jpeg)\s*/gi, "").trim();
            return cleanContent ? (
              <p className="text-sm text-gray-800 leading-normal mb-4 break-words">
                {highlightContent(cleanContent, isToxic)}
              </p>
            ) : null;
          })()}

          {/* Image */}
          {post.image_url && (
            <div className="mb-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative group/img">
              <img 
                src={post.image_url} 
                alt="Post" 
                className={`w-full max-h-96 object-cover transition-all ${isToxic && !isModView ? 'blur-3xl' : ''}`} 
              />
              {isToxic && !isModView && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md">
                  <EyeOff className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          )}

          {/* AI Verdict (Moderator Only) */}
          {post.reason && isModView && (
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 text-xs text-gray-600 mb-4 flex gap-3">
              <Zap className="w-4 h-4 text-[#f55064] shrink-0" />
              <div>
                <span className="text-[#f55064] font-black uppercase text-[9px] tracking-wider block mb-0.5">AI Verdict</span>
                {post.reason}
              </div>
            </div>
          )}

          {/* Footer: Metrics and Actions */}
          {(isModView || score > 80) && (
            <div className="mt-auto flex items-center gap-4 pt-4 border-t border-gray-50/50">
              <div className="flex-1">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Risk Confidence</span>
                  <span className={`text-[9px] font-black ${isToxic ? 'text-red-500' : 'text-gray-900'}`}>{score.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => onOverride(post.id, 'SAFE')}
                    title="Approve as Safe"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onOverride(post.id, 'TOXIC')}
                    title="Reject as Toxic"
                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-[#f55064] hover:text-white transition-all shadow-sm"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
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
