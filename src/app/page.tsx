import { ComicPromptEngineer } from "@/components/comic-prompt-engineer";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Comic Creator AI</h1>
        <p className="text-lg text-gray-600 mt-2">
          Buat komik keren dengan bantuan AI
        </p>
        </div>
      <ComicPromptEngineer />
      </main>
  );
}
