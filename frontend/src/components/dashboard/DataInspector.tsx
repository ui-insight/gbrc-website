import { useState, useEffect, useMemo } from 'react'

type Tab = 'charges' | 'events' | 'crc_users' | 'proposals'

interface ColumnDef {
  key: string
  label: string
  format?: (val: unknown) => string
}

const TABS: { id: Tab; label: string; columns: ColumnDef[] }[] = [
  {
    id: 'charges',
    label: 'Charges',
    columns: [
      { key: 'billing_date', label: 'Date' },
      { key: 'fiscal_year', label: 'FY' },
      { key: 'pi_name', label: 'PI' },
      { key: 'user', label: 'User' },
      { key: 'department', label: 'Department' },
      { key: 'charge_name', label: 'Charge' },
      { key: 'category', label: 'Category' },
      { key: 'total_price', label: 'Total', format: (v) => `$${Number(v).toLocaleString()}` },
      { key: 'is_iids', label: 'IIDS', format: (v) => (v ? 'Yes' : 'No') },
      { key: 'price_type', label: 'Source' },
      { key: 'customer_institute', label: 'Institute' },
      { key: 'payment_index', label: 'Index' },
      { key: 'billing_status', label: 'Status' },
      { key: 'core_name', label: 'Core' },
    ],
  },
  {
    id: 'events',
    label: 'Equipment Events',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'equipment', label: 'Equipment' },
      { key: 'user', label: 'User' },
      { key: 'pi_name', label: 'PI' },
      { key: 'title', label: 'Title' },
      { key: 'department', label: 'Department' },
      { key: 'scheduled_hours', label: 'Sched. Hrs', format: (v) => Number(v).toFixed(1) },
      { key: 'actual_hours', label: 'Actual Hrs', format: (v) => Number(v).toFixed(1) },
      { key: 'event_type', label: 'Type' },
    ],
  },
  {
    id: 'crc_users',
    label: 'CRC Users',
    columns: [
      { key: 'fiscal_year', label: 'FY' },
      { key: 'name', label: 'Name' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'type', label: 'Type' },
      { key: 'service', label: 'Service' },
      { key: 'department', label: 'Department' },
      { key: 'college', label: 'College' },
      { key: 'institution', label: 'Institution' },
    ],
  },
  {
    id: 'proposals',
    label: 'Proposals',
    columns: [
      { key: 'submission_date', label: 'Submitted' },
      { key: 'pi', label: 'PI' },
      { key: 'department', label: 'Department' },
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status' },
      { key: 'sponsor', label: 'Sponsor' },
      { key: 'agreement_type', label: 'Type' },
      { key: 'total_cost', label: 'Total Cost', format: (v) => `$${Number(v).toLocaleString()}` },
      { key: 'iids', label: 'IIDS', format: (v) => (v ? 'Yes' : 'No') },
      { key: 'imci', label: 'IMCI', format: (v) => (v ? 'Yes' : 'No') },
    ],
  },
]

const PAGE_SIZE = 50

function fetchRawData(table: Tab, token: string): Promise<Record<string, unknown>[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`/api/v1/dashboard/raw/${table}`, { headers }).then((r) => {
    if (!r.ok) throw new Error(`API error: ${r.status}`)
    return r.json()
  })
}

export default function DataInspector({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('charges')
  const [data, setData] = useState<Record<Tab, Record<string, unknown>[]>>({
    charges: [],
    events: [],
    crc_users: [],
    proposals: [],
  })
  const [loaded, setLoaded] = useState<Set<Tab>>(new Set())
  const [errors, setErrors] = useState<Partial<Record<Tab, string>>>({})
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(0)

  // Load data for current tab on first view
  useEffect(() => {
    if (loaded.has(activeTab) || errors[activeTab]) return
    let cancelled = false

    fetchRawData(activeTab, token)
      .then((rows) => {
        if (cancelled) return
        setData((prev) => ({ ...prev, [activeTab]: rows }))
        setLoaded((prev) => new Set(prev).add(activeTab))
        setErrors((prev) => ({ ...prev, [activeTab]: undefined }))
      })
      .catch((err) => {
        if (cancelled) return
        setErrors((prev) => ({
          ...prev,
          [activeTab]: err instanceof Error ? err.message : 'Failed to load data',
        }))
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, token, loaded, errors])

  const tabDef = TABS.find((t) => t.id === activeTab)!
  const rows = data[activeTab]
  const activeError = errors[activeTab]
  const loading = !loaded.has(activeTab) && !activeError

  const filtered = useMemo(() => {
    if (!filter) return rows
    const q = filter.toLowerCase()
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [rows, filter])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortAsc])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
    setPage(0)
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Data Inspector</h3>
        <p className="text-sm text-neutral-500 mt-1">Browse raw data tables — click column headers to sort</p>
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setPage(0)
              setSortKey('')
              setSortAsc(true)
              setFilter('')
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
            {loaded.has(tab.id) && (
              <span className="ml-2 text-xs opacity-70">({data[tab.id].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter + pagination controls */}
      <div className="px-6 py-3 flex items-center gap-4 bg-neutral-50 border-b border-neutral-200">
        <input
          type="text"
          placeholder="Filter rows..."
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0) }}
          className="flex-1 max-w-sm px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent"
        />
        <span className="text-sm text-neutral-500">
          {sorted.length} rows
          {filter && ` (filtered from ${rows.length})`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-2 py-1 text-sm border border-neutral-300 rounded disabled:opacity-30 hover:bg-neutral-100"
            >
              Prev
            </button>
            <span className="text-sm text-neutral-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 text-sm border border-neutral-300 rounded disabled:opacity-30 hover:bg-neutral-100"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-neutral-500">Loading data...</div>
      ) : activeError ? (
        <div className="p-8 text-center">
          <p className="text-red-600">Error loading data: {activeError}</p>
          <button
            onClick={() => setErrors((prev) => ({ ...prev, [activeTab]: undefined }))}
            className="mt-3 px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-neutral-100">
              <tr>
                {tabDef.columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-3 py-2 text-left text-neutral-600 font-medium cursor-pointer hover:text-neutral-900 select-none whitespace-nowrap"
                  >
                    {col.label}
                    {sortKey === col.key ? (sortAsc ? ' \u25B2' : ' \u25BC') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-neutral-100 hover:bg-neutral-50 ${
                    activeTab === 'charges' && row.is_iids === true
                      ? 'bg-amber-50'
                      : ''
                  }`}
                >
                  {tabDef.columns.map((col) => {
                    const val = row[col.key]
                    const display = col.format ? col.format(val) : String(val ?? '')
                    return (
                      <td key={col.key} className="px-3 py-1.5 text-neutral-800 whitespace-nowrap">
                        {col.key === 'is_iids' ? (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                              val ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {display}
                          </span>
                        ) : (
                          display
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={tabDef.columns.length} className="px-3 py-8 text-center text-neutral-400">
                    No rows match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
