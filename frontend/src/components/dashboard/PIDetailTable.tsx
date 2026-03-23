import { useState } from 'react'
import type { PIBreakdown } from '../../types/dashboard'
import ChartCard from './ChartCard'

interface PIDetailTableProps {
  data: PIBreakdown[]
  onPIClick?: (piEmail: string) => void
  selectedPI?: string | null
}

type SortKey = 'pi_name' | 'department' | 'total_revenue' | 'iids_revenue' | 'non_iids_revenue' | 'iids_percentage' | 'charge_count'

interface SortHeaderProps {
  field: SortKey
  label: string
  sortKey: SortKey
  sortAsc: boolean
  onSort: (field: SortKey) => void
}

function SortHeader({ field, label, sortKey, sortAsc, onSort }: SortHeaderProps) {
  return (
    <th
      className="py-2 px-3 text-neutral-500 font-medium cursor-pointer hover:text-neutral-900 select-none text-right first:text-left"
      onClick={() => onSort(field)}
    >
      {label} {sortKey === field ? (sortAsc ? '\u25B2' : '\u25BC') : ''}
    </th>
  )
}

export default function PIDetailTable({ data, onPIClick, selectedPI }: PIDetailTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('non_iids_revenue')
  const [sortAsc, setSortAsc] = useState(false)
  const [filter, setFilter] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const filtered = data.filter((pi) => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return pi.pi_name.toLowerCase().includes(q) || pi.department.toLowerCase().includes(q) || pi.pi_email.toLowerCase().includes(q)
  })

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const getRowBg = (pct: number) => {
    if (pct === 0) return 'bg-red-50'
    if (pct >= 100) return 'bg-emerald-50'
    if (pct >= 50) return 'bg-yellow-50'
    return ''
  }

  return (
    <ChartCard title="PI Detail" subtitle="All PIs using GBRC infrastructure — click column headers to sort">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by PI name, college, or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <SortHeader label="PI Name" field="pi_name" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              <SortHeader label="College" field="department" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              <SortHeader label="Total Revenue" field="total_revenue" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              <SortHeader label="IIDS Checkbox Revenue" field="iids_revenue" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              <SortHeader label="Gap" field="non_iids_revenue" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              <SortHeader label="IIDS %" field="iids_percentage" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              <SortHeader label="Charges" field="charge_count" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((pi) => (
              <tr
                key={pi.pi_email}
                className={`border-b border-neutral-100 ${getRowBg(pi.iids_percentage)} ${onPIClick ? 'cursor-pointer hover:bg-neutral-100' : ''} ${selectedPI === pi.pi_email ? 'ring-2 ring-[#f1b300] ring-inset' : ''}`}
                onClick={() => onPIClick?.(pi.pi_email)}
              >
                <td className="py-2 px-3 text-neutral-900 font-medium">{pi.pi_name}</td>
                <td className="py-2 px-3 text-neutral-600 text-right">{pi.department || '—'}</td>
                <td className="py-2 px-3 text-right text-neutral-900">${pi.total_revenue.toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-emerald-700">${pi.iids_revenue.toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-red-700 font-medium">${pi.non_iids_revenue.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    pi.iids_percentage === 0
                      ? 'bg-red-100 text-red-800'
                      : pi.iids_percentage >= 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pi.iids_percentage}%
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-neutral-600">{pi.charge_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && (
        <p className="text-center text-neutral-400 py-8">No PIs match your search.</p>
      )}
    </ChartCard>
  )
}
