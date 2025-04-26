'use client'; // Required for hooks in components

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
  
    const linkStyle = (path: string) =>
      pathname.startsWith(path)
        ? 'text-white font-semibold underline'
        : 'text-white hover:text-amber-600';
  
    return (
      <nav className="w-full bg-[#e77c10] shadow sticky top-0 left-0 z-50">
      <div className="max-w-none h-20 w-full px-4 py-3 flex justify-between items-center">
        <Link href="/home">
          <img src="/logo.png" alt="Freshli Logo" className="h-36 w-auto" />
        </Link>
        <div className="space-x-4 text-sm flex">
        <Link href="/home" className={linkStyle('/home')}>Home</Link>
        <Link href="/inventory" className={linkStyle('/inventory')}>Update Inventory</Link>
        <Link href="/recipes" className={linkStyle('/recipes')}>Recipes</Link>
        </div>
      </div>
      </nav>
    );
  }