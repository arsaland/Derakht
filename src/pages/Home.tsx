import { Link } from 'react-router-dom';
import { TreePine } from 'lucide-react';
import { BackgroundText } from '../components/BackgroundText';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12 text-center relative">
      <BackgroundText />
      
      <div className="space-y-6 relative z-10">
        <TreePine size={64} className="mx-auto" />
        <h1 className="text-5xl font-bold">درخت</h1>
        <p className="text-xl opacity-60">داستان‌سرایی مشارکتی با هوش مصنوعی</p>
      </div>
      
      <nav className="space-y-6 relative z-10">
        <Link 
          to="/host" 
          className="block text-2xl py-4 px-8 text-black bg-white hover:bg-gray-100 
                     transition-colors duration-200 rounded-lg"
        >
          میزبانی بازی
        </Link>
        <Link 
          to="/join" 
          className="block text-xl py-3 px-6 text-white/60 hover:text-white 
                     transition-colors duration-200"
        >
          پیوستن به بازی
        </Link>
      </nav>
    </div>
  );
}