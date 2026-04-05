import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LINKEDIN_SECTORS,
  LINKEDIN_TAXONOMY,
  INDUSTRY_GROUP_TO_SECTOR,
} from '@/constants/linkedinTaxonomy';

interface IndustrySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  disabled?: boolean;
}

/**
 * Grouped searchable multi-select for LinkedIn industry groups.
 * Items are grouped by sector (20 groups), each containing industry groups.
 */
export function IndustrySelect({
  value,
  onChange,
  placeholder = 'Select industries...',
  maxSelections,
  disabled = false,
}: IndustrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTaxonomy = useMemo(() => {
    if (!search.trim()) return LINKEDIN_TAXONOMY;
    const lower = search.toLowerCase();
    const result: Record<string, string[]> = {};
    for (const sector of LINKEDIN_SECTORS) {
      const groups = (LINKEDIN_TAXONOMY[sector] || []).filter(
        (g) =>
          g.toLowerCase().includes(lower) ||
          sector.toLowerCase().includes(lower)
      );
      if (groups.length > 0) {
        result[sector] = groups;
      }
    }
    return result;
  }, [search]);

  const toggle = (group: string) => {
    if (value.includes(group)) {
      onChange(value.filter((v) => v !== group));
    } else if (!maxSelections || value.length < maxSelections) {
      onChange([...value, group]);
    }
  };

  const remove = (group: string) => {
    onChange(value.filter((v) => v !== group));
  };

  const atLimit = maxSelections ? value.length >= maxSelections : false;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="truncate text-muted-foreground">
              {value.length > 0
                ? `${value.length} industr${value.length === 1 ? 'y' : 'ies'} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search industry..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No industries found.</CommandEmpty>
            <div className="max-h-[300px] overflow-y-auto">
              {Object.entries(filteredTaxonomy).map(([sector, groups]) => (
                <CommandGroup key={sector} heading={sector}>
                  {groups.map((group) => {
                    const isSelected = value.includes(group);
                    const isDisabled = !isSelected && atLimit;
                    return (
                      <CommandItem
                        key={group}
                        value={group}
                        onSelect={() => !isDisabled && toggle(group)}
                        className={cn(isDisabled && 'opacity-50')}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {group}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((group) => (
            <Badge key={group} variant="secondary" className="gap-1 pr-1">
              <span className="text-xs text-muted-foreground">
                {INDUSTRY_GROUP_TO_SECTOR[group]?.split(' ')[0] || ''}
              </span>
              {group}
              <button
                type="button"
                onClick={() => remove(group)}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {maxSelections && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
}
