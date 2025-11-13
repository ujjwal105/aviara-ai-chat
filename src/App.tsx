import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "./layouts/DashboardLayout";
import NewChat from "./pages/NewChat";
// import Navbar from "./components/navbar";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DashboardLayout>
        {/* <Navbar /> */}
        <div className="h-screen">
          <NewChat />
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
