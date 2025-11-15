import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "./layouts/DashboardLayout";
import NewChat from "./pages/NewChat";
import { ChatProvider } from "./context/ChatContext";
// import Navbar from "./components/navbar";

function App() {
  return (
    <ChatProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <DashboardLayout>
          {/* <Navbar /> */}
          <div className="h-screen m-4">
            <NewChat />
          </div>
        </DashboardLayout>
      </ThemeProvider>
    </ChatProvider>
  );
}

export default App;
