import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 pt-14 lg:pt-0">
        <Header />

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;