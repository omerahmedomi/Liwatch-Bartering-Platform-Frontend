import { Suspense } from "react";
import CreatePostForm from "@/components/post/CreatePostForm";

export default function CreatePostPage() {
  return (
    <>
      {/* <Navbar isLoggedIn={true} /> */}
      <main className="pt-32 pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase">
              Create a New <span className="text-indigo-600">Listing</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
              Fill in the details to find your perfect match.
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <span className="text-slate-500 dark:text-slate-400 font-semibold animate-pulse">Loading creation form...</span>
            </div>
          }>
            <CreatePostForm />
          </Suspense>
        </div>
      </main>
    </>
  );
}
