import CreatePostForm from "@/components/post/CreatePostForm";

export default function CreatePostPage() {
  return (
    <>
      {/* <Navbar isLoggedIn={true} /> */}
      <main className="pt-32 pb-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Create a New <span className="text-indigo-600">Listing</span>
            </h1>
            <p className="text-slate-500 font-semibold mt-2">
              Fill in the details to find your perfect match.
            </p>
          </div>

          <CreatePostForm />
        </div>
      </main>
    </>
  );
}
