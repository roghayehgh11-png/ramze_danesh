import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, X, ListFilter } from 'lucide-react';

export interface OptionItem {
  value: string;
  label?: string;
}

export interface EditableSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | OptionItem)[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  displayLabel?: string;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید یا بنویسید...',
  className = '',
  required = false,
  disabled = false,
  displayLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText, setTypedText] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: OptionItem[] = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Find if current value matches an option (by value or label)
  const matchedOption = normalizedOptions.find(
    opt => opt.value === value || opt.label === value
  );

  // The text shown in the input box: always prefer human-readable label over raw ID
  const displayValue = typedText !== null
    ? typedText
    : (displayLabel || matchedOption?.label || value || '');

  // Synchronize typedText when value changes from outside
  useEffect(() => {
    if (typedText !== null && value !== typedText) {
      if (matchedOption && matchedOption.label !== typedText) {
        setTypedText(matchedOption.label || matchedOption.value);
      }
    }
  }, [value, matchedOption]);

  // Query for filtering
  const query = typedText !== null ? typedText.trim().toLowerCase() : '';

  // Partition options so ALL options are always accessible!
  const matchingOptions = query
    ? normalizedOptions.filter(opt =>
        (opt.label || '').toLowerCase().includes(query) ||
        (opt.value || '').toLowerCase().includes(query)
      )
    : normalizedOptions;

  const otherOptions = query
    ? normalizedOptions.filter(opt =>
        !(opt.label || '').toLowerCase().includes(query) &&
        !(opt.value || '').toLowerCase().includes(query)
      )
    : [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If user typed something that didn't select an option, keep typed text or restore label
        if (typedText !== null && matchedOption) {
          setTypedText(matchedOption.label || matchedOption.value);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [typedText, matchedOption]);

  const handleSelect = (opt: OptionItem) => {
    const chosenText = opt.label || opt.value;
    onChange(opt.value);
    setTypedText(chosenText);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setTypedText(text);

    // If text matches an option's label or value exactly, map to its value
    const exact = normalizedOptions.find(
      opt => (opt.label || '').toLowerCase() === text.toLowerCase() ||
             (opt.value || '').toLowerCase() === text.toLowerCase()
    );
    if (exact) {
      onChange(exact.value);
    } else {
      onChange(text);
    }
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(prev => !prev);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setTypedText('');
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-3 pl-16 outline-none text-slate-800 dark:text-white text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-text"
        />

        <div className="absolute left-2 flex items-center gap-1">
          {displayValue && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              title="پاک کردن متن"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={handleChevronClick}
            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            title="مشاهده تمام گزینه‌ها"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-1 text-xs animate-scale-up">
          {/* Top Bar: shows option count and clear filter button */}
          <div className="sticky top-0 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-xs px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] z-10">
            <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-blue-500" />
              <span>تمام گزینه‌ها ({normalizedOptions.length} مورد)</span>
            </span>
            {query && (
              <button
                type="button"
                onMouseDown={e => {
                  e.preventDefault();
                  setTypedText('');
                  onChange('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[10px] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded"
              >
                پاک کردن جستجو
              </button>
            )}
          </div>

          {/* If user typed a custom text not matching anything exactly */}
          {query && matchingOptions.length === 0 && (
            <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>مقدار سفارشی «{displayValue}» ثبت خواهد شد</span>
            </div>
          )}

          {/* Section 1: Matching Options */}
          {matchingOptions.length > 0 && (
            <div className="py-1">
              {query && (
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                  گزینه‌های منطبق با جستجو ({matchingOptions.length})
                </div>
              )}
              {matchingOptions.map((opt, idx) => {
                const isSelected = value === opt.value || value === opt.label || displayValue === opt.label || displayValue === opt.value;
                return (
                  <button
                    key={`match-${opt.value}-${idx}`}
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    className={`w-full text-right px-3 py-2 flex items-center justify-between transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{opt.label || opt.value}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mr-2" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 2: Other Options - ALWAYS VISIBLE SO USER NEVER HAS TO DELETE TEXT */}
          {otherOptions.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 py-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <span>سایر گزینه‌های لیست ({otherOptions.length})</span>
                <span className="text-[9px] text-slate-400 font-normal">کلیک جهت انتخاب مستقیم</span>
              </div>
              {otherOptions.map((opt, idx) => {
                const isSelected = value === opt.value || value === opt.label || displayValue === opt.label || displayValue === opt.value;
                return (
                  <button
                    key={`other-${opt.value}-${idx}`}
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    className={`w-full text-right px-3 py-2 flex items-center justify-between transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{opt.label || opt.value}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mr-2" />}
                  </button>
                );
              })}
            </div>
          )}

          {normalizedOptions.length === 0 && (
            <div className="p-3 text-center text-slate-400 text-xs">
              هیچ گزینه‌ای در لیست موجود نیست. می‌توانید متن دلخواه خود را تایپ کنید.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
