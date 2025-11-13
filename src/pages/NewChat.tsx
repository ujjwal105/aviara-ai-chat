import { ArrowUp, CirclePlus } from "lucide-react";

function NewChat() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-300 font-sans relative">
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        <h1 className="flex items-center text-5xl font-medium text-gray-200 mb-12 gap-4">
          <img
            src="/src/assets/logo.svg"
            alt="Aviara AI Logo"
            className="h-12 w-12"
          />
          Welcome to Aviara,{" "}
          <span className="text-[#01DD85] italic -ml-2">Ujjwal</span>
        </h1>
        <div className="w-full">
          <div className="relative bg-[#383838] rounded-xl shadow-lg p-4">
            <textarea
              className="w-full bg-transparent text-gray-200 text-lg placeholder-gray-500 focus:outline-none resize-none"
            //   rows="1"
              placeholder="How can I help you today?"
            ></textarea>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                <button
                  className="text-gray-400 hover:text-gray-200 cursor-pointer"
                  aria-label="Add file"
                >
                  <CirclePlus size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Aviara 1.0</span>
                <button
                  className="flex items-center justify-center w-8 h-8 bg-[#01DD85] rounded-full text-white hover:bg-[#01DD75] cursor-pointer"
                  aria-label="Send message"
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewChat;
