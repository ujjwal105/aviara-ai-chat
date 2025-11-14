import AI_Prompt from "@/components/kokonutui/ai-prompt";

function NewChat() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-300 font-sans relative dark:bg-neutral-900 bg-white rounded-lg border">
      <div className="flex flex-col items-center w-full max-w-4xl px-4">
        <h1 className="lg:flex lg:items-center text-5xl font-medium mb-12 gap-4 text-black dark:text-white/90">
          <img
            src="/src/assets/logo.svg"
            alt="Aviara AI Logo"
            className="h-12 w-12"
          />
          Welcome to Aviara,
          <span className="text-[#01DD85] italic -ml-2">Ujjwal</span>
        </h1>
        <div className="w-full">
          <AI_Prompt />
        </div>
      </div>
    </div>
  );
}

export default NewChat;
