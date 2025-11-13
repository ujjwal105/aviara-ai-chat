"use client";

export default function Navbar() {
  return (
    <header className="fixed top-0 z-10 flex w-full pt-2 bg-accent">
      <div className="bg-sidebar border rounded-lg w-full h-14">
        <div className="flex flex-row items-center ml-auto px-4 gap-4"></div>
      </div>
      <div className="absolute inset-0 bg-background z-[-1]"></div>
    </header>
  );
}
