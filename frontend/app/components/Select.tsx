'use client';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export default function Select({ value, onChange, options, placeholder, className = '' }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none w-full px-4 py-2.5 pr-10
          bg-white dark:bg-gray-700
          border border-gray-300 dark:border-gray-600
          rounded-lg
          text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          cursor-pointer
          hover:border-gray-400 dark:hover:border-gray-500
          ${className}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
