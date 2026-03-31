"use client";

import HomeContent from '@/components/HomeContent';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      {isConnected ? (
        <div>
          <HomeContent />
        </div>
      ) : (
        <div>
          Please connect a wallet...
        </div>
      )}
    </div>
  );
}