"use client";
import React from "react";
import { MessageCircle, ArrowLeft, Sparkles } from "lucide-react";

const ChatContent: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8 inline-block">
          {/* Outer glow circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />

          {/* Main icon container */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            <MessageCircle size={48} className="text-white" strokeWidth={1.5} />

            {/* Floating sparkle 1 */}
            <div className="absolute -top-2 -right-2 animate-float-slow">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>

            {/* Floating sparkle 2 */}
            <div className="absolute -bottom-1 -left-2 animate-float-delayed">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
                <Sparkles size={12} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Select a chat to start messaging
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Choose a conversation from the sidebar to view messages and continue
          chatting with your friends
        </p>

        {/* Mobile hint */}
        <div className="mt-8 sm:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
            <ArrowLeft size={16} />
            <span>Tap the sidebar to select a chat</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ChatContent;
