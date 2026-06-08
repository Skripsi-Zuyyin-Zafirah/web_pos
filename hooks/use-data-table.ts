'use client'

import { useState, useCallback, useMemo } from 'react'

export type SortOrder = 'asc' | 'desc'

interface UseDataTableOptions {
  defaultSortField?: string
  defaultSortOrder?: SortOrder
  defaultPageSize?: number
}

export function useDataTable({
  defaultSortField,
  defaultSortOrder = 'desc',
  defaultPageSize = 10,
}: UseDataTableOptions = {}) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleSort = useCallback((field: string) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortOrder('asc')
      return field
    })
    setCurrentPage(1)
  }, [])

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedRows(new Set()), [])

  const toggleAllOnPage = useCallback((pageIds: string[]) => {
    setSelectedRows((prev) => {
      const allSelected = pageIds.every((id) => prev.has(id))
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }, [])

  /** Sort any array. Pass a custom `getValue` to extract values for comparison. */
  const sortData = useCallback(<T>(
    data: T[],
    getValue: (item: T, field: string) => any,
  ): T[] => {
    if (!sortBy) return data
    return [...data].sort((a, b) => {
      const valA = getValue(a, sortBy)
      const valB = getValue(b, sortBy)
      if (valA == null) return 1
      if (valB == null) return -1
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
    })
  }, [sortBy, sortOrder])

  /** Slice data for the current page */
  const paginateData = useCallback(<T>(data: T[]): T[] => {
    const start = (currentPage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [currentPage, pageSize])

  const getTotalPages = useCallback(
    (total: number) => Math.max(1, Math.ceil(total / pageSize)),
    [pageSize],
  )

  const resetPage = useCallback(() => setCurrentPage(1), [])

  const isAllOnPageSelected = useCallback(
    (pageIds: string[]) => pageIds.length > 0 && pageIds.every((id) => selectedRows.has(id)),
    [selectedRows],
  )

  const isIndeterminate = useCallback(
    (pageIds: string[]) => pageIds.some((id) => selectedRows.has(id)) && !isAllOnPageSelected(pageIds),
    [selectedRows, isAllOnPageSelected],
  )

  return {
    // search
    search, setSearch,
    // sort
    sortBy, sortOrder, handleSort,
    sortData,
    // pagination
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    paginateData, getTotalPages, resetPage,
    // selection
    selectedRows, setSelectedRows,
    toggleRow, clearSelection, toggleAllOnPage,
    isAllOnPageSelected, isIndeterminate,
  }
}
