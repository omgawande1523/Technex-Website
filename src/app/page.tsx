import Navbar from "../components/navigation/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1 className="text-center text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-8xl md:text-9xl">
          TECHNEX
        </h1>
      </div>
    </>
  );
}
