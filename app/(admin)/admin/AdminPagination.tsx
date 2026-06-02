"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ currentPage, totalPages, onPageChange }: AdminPaginationProps) {
  // Always render something so the layout doesn't jump, even if 0 or 1 pages
  const displayTotal = Math.max(1, totalPages);
  
  // Calculate page numbers to display (showing max 5 page buttons)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (displayTotal <= maxVisiblePages) {
      for (let i = 0; i < displayTotal; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push(-1); // -1 represents ellipsis
        pages.push(displayTotal - 1);
      } else if (currentPage >= displayTotal - 3) {
        pages.push(0);
        pages.push(-1);
        for (let i = displayTotal - 4; i < displayTotal; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(-1);
        pages.push(displayTotal - 1);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-100 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 w-full">
      <div className="font-semibold text-slate-500">
        Showing Page <span className="text-slate-700 dark:text-slate-300">{currentPage + 1}</span> of <span className="text-slate-700 dark:text-slate-300">{displayTotal}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
          className="p-1.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, index) => (
            p === -1 ? (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-600">
                <MoreHorizontal size={14} />
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all cursor-pointer ${
                  currentPage === p 
                    ? "bg-indigo-600 text-white border-none shadow-md" 
                    : "bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {p + 1}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, displayTotal - 1))}
          disabled={currentPage >= displayTotal - 1}
          className="p-1.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
