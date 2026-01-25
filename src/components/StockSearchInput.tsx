import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Stock } from '@/types/stock';

interface StockSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (stock: Stock) => void;
  placeholder?: string;
  autoNavigate?: boolean;
}

export function StockSearchInput({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Search stocks by ticker or name...",
  autoNavigate = true
}: StockSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchStocks = async () => {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      const searchTerm = value.trim().toUpperCase();

      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .or(`ticker.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .order('market_cap', { ascending: false })
        .limit(8);

      if (!error && data) {
        setSuggestions(data);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(searchStocks, 200);
    return () => clearTimeout(debounce);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: Stock) => {
    onChange(stock.ticker);
    setShowDropdown(false);
    onSelect?.(stock);
    
    if (autoNavigate) {
      navigate(`/analyze?ticker=${stock.ticker}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        if (autoNavigate) {
          navigate(`/analyze?ticker=${value.trim().toUpperCase()}`);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else if (value.trim()) {
          if (autoNavigate) {
            navigate(`/analyze?ticker=${value.trim().toUpperCase()}`);
          }
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setShowDropdown(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {suggestions.map((stock, index) => (
            <button
              key={stock.id}
              onClick={() => handleSelect(stock)}
              className={cn(
                "w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left",
                selectedIndex === index && "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {stock.ticker.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{stock.ticker}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {stock.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">₹{stock.price?.toLocaleString()}</p>
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    (stock.price_change || 0) >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {(stock.price_change || 0) >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stock.price_change?.toFixed(2)}%
                  </div>
                </div>
                {stock.ai_tag && (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    stock.ai_tag === 'Hot' && 'bg-destructive/20 text-destructive',
                    stock.ai_tag === 'Rising' && 'bg-success/20 text-success',
                    !['Hot', 'Rising'].includes(stock.ai_tag || '') && 'bg-muted text-muted-foreground'
                  )}>
                    {stock.ai_tag}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
