import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "../../data/countries.js";

export default function CountrySelect({ id, value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(country) {
    setQuery(country);
    onChange(country);
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Start typing a country..."
        autoComplete="off"
        required
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
      />

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.map((country) => (
            <li key={country}>
              <button
                type="button"
                onClick={() => handleSelect(country)}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                {country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}