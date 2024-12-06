import { Link } from 'react-router-dom';
import { BackgroundText } from '../components/BackgroundText';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12 text-center relative">
      <BackgroundText />

      <div className="space-y-6 relative z-10">
        <img 
          src="/fonts/derakht-logo.png" 
          alt="درخت"
          className="h-32 mx-auto"
        />
        <p className="text-xl opacity-60">داستان‌سرایی جمعی با هوش مصنوعی</p>
      </div>

      <nav className="space-y-6 relative z-10">
        <Link
          to="/host"
          className="block text-2xl py-4 px-8 text-black bg-white hover:bg-gray-100 
                     transition-colors duration-200 rounded-lg"
        >
          میزبان
        </Link>
        <Link
          to="/join"
          className="block text-xl py-3 px-6 text-white/60 hover:text-white 
                     transition-colors duration-200"
        >
          مهمان
        </Link>
      </nav>
    </div>
  );
}