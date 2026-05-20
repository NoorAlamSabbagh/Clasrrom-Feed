"use client";

import { useState } from "react";
import axios from "axios";
import { Send, User, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Admin() {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [recentPosts, setRecentPosts] = useState<{ id: number, content: string, author: string }[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !author.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post(`${API_URL}/feed`, { 
        content: content.trim(), 
        author: author.trim() 
      });
      setRecentPosts(prev => [response.data, ...prev].slice(0, 5));
      setContent("");
      setStatus({ type: 'success', message: 'Feed posted successfully!' });
    } catch (err) {
      console.error("Error posting feed:", err);
      setStatus({ type: 'error', message: 'Failed to post feed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Coach Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Create New Feed Entry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                      Coach Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                        placeholder="e.g. Coach Sarah"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Feed Content
                    </label>
                    <textarea
                      id="content"
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                      placeholder="What's on your mind? Share an update with your students..."
                      required
                    ></textarea>
                  </div>

                  {status && (
                    <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {status.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Post Update
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Recent Posts</h3>
              {recentPosts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No posts in this session.</p>
              ) : (
                <ul className="space-y-4">
                  {recentPosts.map((post) => (
                    <li key={post.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                      <span className="text-xs text-gray-400 mt-1 block">Just now</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
