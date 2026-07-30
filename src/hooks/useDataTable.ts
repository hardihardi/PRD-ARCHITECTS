import { useState, useMemo } from 'react';

interface UseDataTableProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  initialPageSize?: number;
  filterField?: keyof T;
}

export function useDataTable<T>({ data, searchFields, initialPageSize = 10, filterField }: UseDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    let result = data;

    // Apply Filter first
    if (filterField && filterValue !== "all") {
      result = result.filter(item => item[filterField] === filterValue);
    }

    // Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        return searchFields.some(field => {
          const val = item[field];
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return val.toString().includes(q);
          return false;
        });
      });
    }

    return result;
  }, [data, searchQuery, searchFields, filterValue, filterField]);

  // Apply Filter if needed later via component side using filteredData

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Ensure current page is valid when data changes
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const exportCSV = (filename: string, columns: { header: string, key: keyof T | ((item: T) => string) }[]) => {
    const headerRow = columns.map(c => `"${c.header}"`).join(",");
    const dataRows = filteredData.map(item => {
      return columns.map(c => {
        let val;
        if (typeof c.key === 'function') {
          val = c.key(item);
        } else {
          val = item[c.key];
        }
        const strVal = String(val ?? "").replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(",");
    });
    
    const csvString = [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.classList.add("print-target");
    document.body.classList.add("printing-element-active");
    const originalTitle = document.title;
    document.title = filename;
    
    window.print();
    
    document.title = originalTitle;
    document.body.classList.remove("printing-element-active");
    element.classList.remove("print-target");
  };

  return {
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    filteredData,
    currentData,
    exportCSV,
    exportPDF
  };
}
