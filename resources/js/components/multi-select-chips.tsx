import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

type Option = { value: number; label: string }

export default function MultiSelectChips({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
}: {
  options: Option[]
  value: number[]
  onChange: (next: number[]) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label]))
    return value.map((v) => ({ value: v, label: map.get(v) ?? String(v) }))
  }, [options, value])

  const toggle = (v: number) => {
    const exists = value.includes(v)
    const next = exists ? value.filter((x) => x !== v) : [...value, v]
    onChange(next)
  }

  const clearOne = (v: number) => onChange(value.filter((x) => x !== v))

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full min-h-10 justify-start overflow-hidden"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selected.map((s) => (
                <Badge
                  key={s.value}
                  variant="secondary"
                  className="pr-1"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    clearOne(s.value)
                  }}
                >
                  {s.label}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-3 opacity-70"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Badge>
              ))}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(420px,90vw)]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Select supervisors</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-auto">
          {options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

