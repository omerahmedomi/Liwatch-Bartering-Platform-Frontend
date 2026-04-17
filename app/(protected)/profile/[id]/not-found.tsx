"use client"
import { Info } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound(){
    const router = useRouter()
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Info size={40} className="text-slate-400 mb-4" />
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Profile Not Found
        </h2>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 font-bold hover:underline cursor-pointer"
        >
          Go back to Market
        </button>
      </div>
     )
}