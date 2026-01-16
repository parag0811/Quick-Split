import { PanelLeft } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full bg-[#1a1b1b] h-16 flex justify-between items-center px-4">
        <button onClick={toggleSidebar} className="cursor-pointer">
          <PanelLeft size={24} strokeWidth={3} />
        </button>
        <button className="mr-16 cursor-pointer bg-white text-black px-3 py-1.5 rounded-xl font-semibold hover:text-white hover:bg-[#222255] transition">
          LogOut
        </button>
      </header>
    </>
  );
};

export default Header;
