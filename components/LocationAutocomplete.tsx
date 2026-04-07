import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { ETHIOPIAN_CITIES } from "@/lib/cities";

// The Smart Input Component
export function LocationAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter cities based on user input
  const filteredCities =ETHIOPIAN_CITIES.filter((city) =>
    city.toLowerCase().includes(value.toLowerCase()),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <MapPin size={20} />
      </div>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/10 outline-none font-bold text-xs  transition-all"
        // required
      />

      {/* The Slick Dropdown */}
      {isOpen && value && filteredCities.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 py-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {filteredCities.map((city) => (
            <li
              key={city}
              onClick={() => {
                onChange(city); // Set the clicked city
                setIsOpen(false); // Close dropdown
              }}
              className="px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
