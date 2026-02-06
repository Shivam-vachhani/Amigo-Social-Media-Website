"use client";
import React from "react";
import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Users,
  Globe,
} from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className=" overflow-y-auto lg:h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 h-full flex items-center py-4">
        <div className="grid lg:grid-cols-2 gap-6 items-center w-full">
          {/* Left Section - Branding & Features (Shared) */}
          <div className="text-center lg:text-left space-y-5 px-4">
            {/* Logo & Brand */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Amigo
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                Connect, Share,
                <br />& Make Friends
              </h1>

              <p className="text-base text-gray-600 max-w-md mx-auto lg:mx-0">
                Your social platform to share moments, express yourself, and
                build meaningful connections around the world.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center mb-2 shadow-md">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-0.5">
                  Share Posts
                </h3>
                <p className="text-xs text-gray-600">
                  Express yourself with posts and photos
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mb-2 shadow-md">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-0.5">
                  Live Chat
                </h3>
                <p className="text-xs text-gray-600">
                  Connect instantly with friends
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center mb-2 shadow-md">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-0.5">
                  Photo Albums
                </h3>
                <p className="text-xs text-gray-600">
                  Share your life in pictures
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center mb-2 shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-0.5">
                  Make Friends
                </h3>
                <p className="text-xs text-gray-600">Grow your social circle</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 max-w-lg mx-auto lg:mx-0 shadow-lg">
              <div className="flex items-center justify-center lg:justify-start gap-6 flex-wrap">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-xs text-gray-600">Active Users</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-xs text-gray-600">Posts Shared</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    100K+
                  </div>
                  <div className="text-xs text-gray-600">Connections Made</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Dynamic Content (Login/Register) */}
          <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-md">
              {children}

              {/* Footer Note */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Join millions connecting worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
