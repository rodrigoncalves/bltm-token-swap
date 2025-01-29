'use client';

import Home from './components/Home';
import MainContainer from './components/MainContainer';

export default function App() {
  return (
    <div className="items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header>
        <h1 className="mt-10 text-[32px] font-bold mb-4">BLTM Token Swap</h1>
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <MainContainer>
          <Home />
        </MainContainer>
      </main>
    </div>
  );
}
