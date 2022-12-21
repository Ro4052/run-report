import type { ReactNode } from 'react';
import Link from 'next/link';

export interface PageProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const Page = ({ children, showFooter = true }: PageProps) => (
  <div className='flex flex-col h-screen p-4'>
    <div className='grow'>
      {children}
    </div>
    {showFooter && (
      <div className='text-right text-xs'>
        <Link className='hover:underline' href='/privacy-and-cookies'>Privacy and Cookies</Link>
      </div>
    )}
  </div>
);
