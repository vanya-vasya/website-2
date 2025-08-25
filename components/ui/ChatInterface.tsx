import React from "react";
import Image from "next/image";

const ChatInterface = () => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {/* User message */}
      <div className="flex gap-4 max-w-3xl mx-auto">
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
          <Image
            src="/images/icons/user.png"
            alt="Text Icon"
            width={18}
            height={18}
          />
        </div>{" "}
        <div className="flex-1">
          <div className="font-medium mb-1 text-white">You</div>
          <div className="bg-slate-700 rounded-lg p-4 shadow-sm dark:text-gray-200">
            Create a 30-second script for a product video about a new smartphone
            camera with advanced AI features.
          </div>
        </div>
      </div>

      {/* Model response */}
      <div className="flex gap-4 max-w-3xl mx-auto">
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
          <Image
            src="/images/icons/ai.png"
            alt="Text Icon"
            width={20}
            height={20}
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-white mb-1">Zinvero</div>
          <div className="bg-slate-700 rounded-lg p-4 shadow-sm dark:text-gray-200">
            <strong>SMARTPHONE AI CAMERA - 30 SEC SCRIPT</strong>
            <br />
            <br />
            [Open with close-up of phone camera]
            <br />
            NARRATOR: &quot;Introducing the future of mobile photography.&quot;
            <br />
            <br />
            [Show person taking photo in low light]
            <br />
            NARRATOR: &quot;Our new AI camera doesn&apos;t just take pictures -
            it understands them.&quot;
            <br />
            <br />
            [Split screen showing before/after AI enhancement]
            <br />
            NARRATOR: &quot;Advanced AI adjusts lighting, recognizes subjects,
            and enhances details in real-time.&quot;
            <br />
            <br />
            [Show various quick shots of amazing photos]
            <br />
            NARRATOR: &quot;Professional quality. Effortless results. Every
            time.&quot;
            <br />
            <br />
            [Product shot with logo]
            <br />
            NARRATOR: &quot;The new PhoneX Pro. Intelligence you can
            capture.&quot;
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button className="text-white-300/10">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              5 tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
