/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ExternalLink, Github, Linkedin, Mail, Upload, Image as ImageIcon, Film, Code2, Trash2, MessageSquare, Star, LogIn, LogOut } from 'lucide-react';
import { db, auth, signInWithGoogle, logOut } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- Types ---
interface Project {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  liveLink: string;
  techStack: string[];
  createdAt: number;
  authorUid: string;
}

interface Review {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  createdAt: number;
}

const ADMIN_EMAIL = 'sabhadiyadev99@gmail.com';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
    }, (error) => {
      console.error("Error fetching projects:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'createdAt' | 'authorUid'>) => {
    if (!user || !isAdmin) return;
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProjectData,
        createdAt: Date.now(),
        authorUid: user.uid
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user || !isAdmin) return;
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white selection:bg-gold selection:text-black">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-charcoal/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-black font-display font-bold text-xl">
              D
            </div>
            <span className="font-display font-semibold text-xl tracking-tight">Dev<span className="text-gold">.</span></span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#work" className="hover:text-gold transition-colors">Work</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                  <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-white/10" />
                  <span className="truncate max-w-[100px]">{user.displayName}</span>
                </div>
                {isAdmin && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-charcoal-light border border-gold/30 hover:border-gold text-gold px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                  >
                    <Plus size={18} />
                    <span className="text-sm font-medium hidden sm:inline">Add Project</span>
                  </motion.button>
                )}
                <button onClick={logOut} className="p-2 text-gray-400 hover:text-white transition-colors" title="Log Out">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                <LogIn size={18} />
                <span className="text-sm hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="py-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8 group"
          >
            <div className="absolute inset-0 rounded-full bg-gold blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <img 
              src="/profile.jpg" 
              alt="Profile" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/profile.jpg";
              }}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-gold/50 p-1"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6"
          >
            Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-400">Digital</span> Luxury.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-light"
          >
            I build high-end, performant web experiences that elevate brands. Specialized in React, modern aesthetics, and seamless interactions.
          </motion.p>
        </section>

        {/* Projects Grid */}
        <section id="work" className="py-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-semibold">Selected Works</h2>
            <div className="h-px bg-gradient-to-r from-gold/50 to-transparent flex-1 ml-8"></div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No projects added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence>
                {projects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    index={index} 
                    isAdmin={isAdmin}
                    onDelete={() => handleDeleteProject(project.id)}
                    user={user}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 border-t border-white/5 mt-20">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-display font-semibold mb-6">Let's Work Together</h2>
            <p className="text-gray-400 max-w-xl mb-10">
              Ready to elevate your digital presence? Get in touch to discuss your next project.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-2 p-4 rounded-xl bg-charcoal-light border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Mail size={24} />
                <span className="font-medium">Email Me</span>
              </a>
              <a href="#" className="flex items-center gap-2 p-4 rounded-xl bg-charcoal-light border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Linkedin size={24} />
                <span className="font-medium">LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-2 p-4 rounded-xl bg-charcoal-light border border-white/10 hover:border-gold hover:text-gold transition-all duration-300">
                <Github size={24} />
                <span className="font-medium">GitHub</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <AddProjectModal 
            onClose={() => setIsModalOpen(false)} 
            onAdd={handleAddProject} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Components ---

function ProjectCard({ project, index, isAdmin, onDelete, user }: { project: Project; index: number; isAdmin: boolean; onDelete: () => void; user: User | null }) {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="group relative bg-charcoal-light rounded-2xl overflow-hidden border border-white/5 hover:border-gold/50 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(255,215,0,0.1)] flex flex-col"
      >
        <div className="aspect-[16/10] overflow-hidden relative bg-black">
          {project.mediaType === 'image' ? (
            <img 
              src={project.mediaUrl} 
              alt={project.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <video 
              src={project.mediaUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-light via-transparent to-transparent"></div>
          
          {isAdmin && (
            <button 
              onClick={onDelete}
              className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors z-20"
              title="Delete Project"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        
        <div className="p-8 relative z-10 -mt-12 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-display font-semibold group-hover:text-gold transition-colors">{project.title}</h3>
            <a 
              href={project.liveLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-charcoal border border-white/10 hover:border-gold hover:text-gold transition-all"
            >
              <ExternalLink size={18} />
            </a>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech, i) => (
              <span key={i} className="text-xs font-mono px-3 py-1 rounded-full bg-charcoal border border-white/10 text-gray-300">
                {tech}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <button 
              onClick={() => setShowReviews(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors"
            >
              <MessageSquare size={16} />
              <span>Reviews</span>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showReviews && (
          <ReviewsModal 
            project={project} 
            user={user} 
            onClose={() => setShowReviews(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewsModal({ project, user, onClose }: { project: Project; user: User | null; onClose: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(allReviews.filter(r => r.projectId === project.id));
    });
    return () => unsubscribe();
  }, [project.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        projectId: project.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        rating,
        comment: newComment.trim(),
        createdAt: Date.now()
      });
      setNewComment('');
      setRating(5);
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      ></motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-charcoal-light border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-display font-semibold text-gold">Reviews for {project.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-charcoal p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={review.userPhoto || 'https://via.placeholder.com/40'} alt={review.userName} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">{review.userName}</p>
                      <div className="flex text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-gold" : "text-gray-600"} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-charcoal">
          {user ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star size={20} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "text-gold" : "text-gray-600 hover:text-gold/50"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a review..."
                  className="flex-1 bg-charcoal-light border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-gold text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                >
                  Post
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">Sign in to leave a review</p>
              <button 
                onClick={signInWithGoogle}
                className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AddProjectModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Omit<Project, 'id' | 'createdAt' | 'authorUid'>) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [techStack, setTechStack] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to Firebase Storage here.
      // For this prototype, we'll use a local object URL for preview,
      // but you should replace this with actual upload logic.
      // Since we can't easily upload to storage without setting it up, 
      // we'll ask the user to provide a URL directly for now, or use a data URI.
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setMediaUrl(base64String);
        setPreviewUrl(base64String);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !mediaUrl) return;

    onAdd({
      title,
      description,
      liveLink: liveLink || '#',
      mediaUrl,
      mediaType,
      techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      ></motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-charcoal-light border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-display font-semibold text-gold">Add New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="add-project-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Project Media</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${previewUrl ? 'border-gold/50 bg-black' : 'border-white/10 hover:border-gold/50 bg-charcoal'}`}
              >
                {previewUrl ? (
                  <div className="aspect-[16/9] relative">
                    {mediaType === 'image' ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={previewUrl} className="w-full h-full object-cover" autoPlay loop muted />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Upload size={18} /> Change Media
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-500 hover:text-gold transition-colors">
                    <div className="flex gap-4 mb-4">
                      <ImageIcon size={32} />
                      <Film size={32} />
                    </div>
                    <p className="text-sm font-medium">Click to upload image or video</p>
                    <p className="text-xs mt-1 opacity-70">Supports JPG, PNG, MP4, WEBM</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  placeholder="e.g. Aura E-Commerce"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Live Link</label>
                <input 
                  type="url" 
                  value={liveLink}
                  onChange={e => setLiveLink(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Description</label>
              <textarea 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                placeholder="Briefly describe the project..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Tech Stack (comma separated)</label>
              <div className="relative">
                <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  placeholder="React, Tailwind, Node.js..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/5 bg-charcoal-light flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-project-form"
            disabled={!title || !description || !mediaUrl}
            className="px-6 py-2.5 rounded-lg font-medium bg-gold text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]"
          >
            Publish Project
          </button>
        </div>
      </motion.div>
    </div>
  );
}

