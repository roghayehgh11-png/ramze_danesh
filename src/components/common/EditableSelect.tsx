import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

interface OptionItem {
  value: string;
  label?: string;
}

interface EditableSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | OptionItem)[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید یا بنویسید...',
  className = '',
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: OptionItem[] = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Filter options based on input
  const filteredOptions = normalizedOptions.filter(opt =>
    (opt.label || opt.value || '').toLowerCase().includes((value || '').toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-3 pl-9 outline-none text-slate-800 dark:text-white text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs animate-scale-up">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 flex items-center justify-between transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                    isSelected ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{opt.label || opt.value}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mr-2" />}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-slate-400 text-[11px] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              <span>مورد جدید «{value}» تایپ شده است</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
