import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
          aria-label="VietExplore AI Home"
        >
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-headline">VietExplore AI</span>
        </Link>
      </div>
    </header>
  );
}
