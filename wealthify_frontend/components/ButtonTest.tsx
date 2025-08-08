'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ButtonTest() {
  const router = useRouter();

  const handleClick = () => {
    console.log('Button clicked!');
    router.push('/register');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Button Test Component</h2>
      
      {/* Test 1: Link component */}
      <div>
        <h3 className="font-semibold mb-2">Test 1: Link Component</h3>
        <Link 
          href="/register"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-block"
        >
          Get Started (Link)
        </Link>
      </div>

      {/* Test 2: Button with onClick */}
      <div>
        <h3 className="font-semibold mb-2">Test 2: Button with onClick</h3>
        <button 
          onClick={handleClick}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Get Started (onClick)
        </button>
      </div>

      {/* Test 3: Direct navigation */}
      <div>
        <h3 className="font-semibold mb-2">Test 3: Direct Navigation</h3>
        <button 
          onClick={() => window.location.href = '/register'}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Get Started (Direct)
        </button>
      </div>
    </div>
  );
} 