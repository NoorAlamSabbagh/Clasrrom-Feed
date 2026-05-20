"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import axios from "axios";
import { MessageSquare, User, Clock } from "lucide-react";

interface FeedItem {
  id: number;
  content: string;
  author: string;
  created_at: string;
}

export default function Home() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    setMounted(true);
    setIsConnected(socket.connected);

    // Fetch initial feeds
    const fetchFeeds = async () => {
      try {
        const response = await axios.get(`${API_URL}/feed`);
        setFeeds(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feeds:", err);
        setError("Failed to load feeds. Please try again later.");
        setLoading(false);
      }
    };

    fetchFeeds();

    // Socket listeners
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNewFeed(newFeed: FeedItem) {
      setFeeds((prev) => [newFeed, ...prev]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-feed", onNewFeed);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-feed", onNewFeed);
    };
  }, [API_URL]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Coaching Feed
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Real-time updates from your coaches
          </p>
          {mounted && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected (Attempting to reconnect...)'}
              </span>
            </div>
          )}
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading feeds...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {feeds.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No feeds available yet.</p>
            ) : (
              feeds.map((feed) => (
                <div key={feed.id} className="bg-white shadow rounded-lg overflow-hidden transition-all hover:shadow-md border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg text-gray-800 leading-relaxed">
                          {feed.content}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-gray-700">{feed.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(feed.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
