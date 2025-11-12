import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DashboardLayout>
        <div className="flex items-center justify-center">Hello Aviara</div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
