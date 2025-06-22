import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { Candidate, ExportOptions, FilterOptions } from '../types'

// Column mappings for Excel export
const COLUMN_MAPPINGS = {
  full_name: 'Nome Completo',
  email: 'Email',
  phone: 'Telefono',
  position: 'Posizione',
  experience_level: 'Livello Esperienza',
  status: 'Stato',
  location: 'Località',
  salary_expectation: 'RAL Richiesta',
  skills: 'Competenze',
  notes: 'Note',
  created_at: 'Data Inserimento',
  updated_at: 'Ultimo Aggiornamento'
}

// Status translations
const STATUS_TRANSLATIONS = {
  new: 'Nuovo',
  screening: 'Screening',
  interview: 'Colloquio',
  offer: 'Offerta',
  hired: 'Assunto',
  rejected: 'Scartato',
  review: 'In revisione'  // aggiunto stato mancante
}

// Experience level translations
const EXPERIENCE_TRANSLATIONS = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead/Manager'
}

// Format candidate data for export
function formatCandidateForExport(candidate: Candidate): Record<string, any> {
  return {
    [COLUMN_MAPPINGS.full_name]: candidate.full_name,
    [COLUMN_MAPPINGS.email]: candidate.email,
    [COLUMN_MAPPINGS.phone]: candidate.phone || '-',
    [COLUMN_MAPPINGS.position]: candidate.position,
    [COLUMN_MAPPINGS.experience_level]: EXPERIENCE_TRANSLATIONS[candidate.experience_level],
    [COLUMN_MAPPINGS.status]: STATUS_TRANSLATIONS[candidate.status] ?? candidate.status,
    [COLUMN_MAPPINGS.location]: candidate.location || '-',
    [COLUMN_MAPPINGS.salary_expectation]: candidate.salary_expectation 
      ? `€${candidate.salary_expectation.toLocaleString('it-IT')}` 
      : '-',
    [COLUMN_MAPPINGS.skills]: candidate.skills.join(', '),
    [COLUMN_MAPPINGS.notes]: candidate.notes || '-',
    [COLUMN_MAPPINGS.created_at]: format(new Date(candidate.created_at), 'dd/MM/yyyy', { locale: it }),
    [COLUMN_MAPPINGS.updated_at]: format(new Date(candidate.updated_at), 'dd/MM/yyyy', { locale: it })
  }
}

// Apply filters to candidates data
function applyFilters(candidates: Candidate[], filters?: FilterOptions): Candidate[] {
  if (!filters) return candidates

  let filteredCandidates = candidates

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    filteredCandidates = filteredCandidates.filter(candidate => 
      filters.status!.includes(candidate.status)
    )
  }

  // Filter by experience level
  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    filteredCandidates = filteredCandidates.filter(candidate => 
      filters.experienceLevel!.includes(candidate.experience_level)
    )
  }

  // Filter by position
  if (filters.position && filters.position.length > 0) {
    filteredCandidates = filteredCandidates.filter(candidate => 
      filters.position!.some(pos => candidate.position.toLowerCase().includes(pos.toLowerCase()))
    )
  }

  // Filter by date range
  if (filters.dateRange) {
    filteredCandidates = filteredCandidates.filter(candidate => {
      const candidateDate = new Date(candidate.created_at)
      return candidateDate >= filters.dateRange!.start && candidateDate <= filters.dateRange!.end
    })
  }

  return filteredCandidates
}

// Create Excel workbook with styling
function createStyledWorkbook(data: Record<string, any>[], title: string) {
  const workbook = XLSX.utils.book_new()
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Calculate column widths
  const columnWidths: { wch: number }[] = []
  const headers = Object.keys(data[0] || {})
  
  headers.forEach((header, index) => {
    let maxWidth = header.length
    data.forEach(row => {
      const cellValue = String(row[header] || '')
      maxWidth = Math.max(maxWidth, cellValue.length)
    })
    columnWidths[index] = { wch: Math.min(maxWidth + 2, 50) } // Max width 50 chars
  })
  
  worksheet['!cols'] = columnWidths
  
  // Add header styling (this would require xlsx-style for full styling)
  // For now, we'll just ensure proper formatting
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  
  // Format salary columns as currency
  for (let row = range.s.r + 1; row <= range.e.r + 1; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]
      
      if (cell && headers[col] === COLUMN_MAPPINGS.salary_expectation) {
        // This is a salary column
        if (cell.v && typeof cell.v === 'string' && cell.v.startsWith('€')) {
          // Keep as formatted string
          cell.t = 's'
        }
      }
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, title)
  
  return workbook
}

// Main export function
export async function exportCandidatesToExcel(
  candidates: Candidate[],
  options: ExportOptions = {}
): Promise<void> {
  try {
    const {
      format: exportFormat = 'xlsx',
      filename,
      includeColumns,
      filters
    } = options

    // Apply filters
    const filteredCandidates = applyFilters(candidates, filters)
    
    if (filteredCandidates.length === 0) {
      throw new Error('Nessun candidato da esportare con i filtri applicati')
    }

    // Format data for export
    let formattedData = filteredCandidates.map(formatCandidateForExport)

    // Filter columns if specified
    if (includeColumns && includeColumns.length > 0) {
      formattedData = formattedData.map(row => {
        const filteredRow: Record<string, any> = {}
        includeColumns.forEach(col => {
          const translatedCol = COLUMN_MAPPINGS[col as keyof typeof COLUMN_MAPPINGS]
          if (translatedCol && row[translatedCol] !== undefined) {
            filteredRow[translatedCol] = row[translatedCol]
          }
        })
        return filteredRow
      })
    }

    // Generate filename
    const defaultFilename = `candidati_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`
    const finalFilename = filename || defaultFilename

    if (exportFormat === 'xlsx') {
      // Create Excel workbook
      const workbook = createStyledWorkbook(formattedData, 'Candidati')
      
      // Write file
      XLSX.writeFile(workbook, `${finalFilename}.xlsx`)
    } else if (exportFormat === 'csv') {
      // Create CSV
      const worksheet = XLSX.utils.json_to_sheet(formattedData)
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${finalFilename}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    }

  } catch (error) {
    console.error('Export error:', error)
    throw new Error(`Errore durante l'esportazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
  }
}

// Export summary statistics
export async function exportSummaryReport(
  candidates: Candidate[],
  filename?: string
): Promise<void> {
  try {
    // Calculate summary statistics
    const totalCandidates = candidates.length
    const statusCounts = candidates.reduce((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const experienceCounts = candidates.reduce((acc, candidate) => {
      acc[candidate.experience_level] = (acc[candidate.experience_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const positionCounts = candidates.reduce((acc, candidate) => {
      acc[candidate.position] = (acc[candidate.position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Create summary data
    const summaryData = [
      { Metrica: 'Totale Candidati', Valore: totalCandidates },
      { Metrica: '', Valore: '' }, // Empty row
      { Metrica: 'STATO CANDIDATI', Valore: '' },
      ...Object.entries(statusCounts).map(([status, count]) => ({
        Metrica: STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS],
        Valore: count
      })),
      { Metrica: '', Valore: '' }, // Empty row
      { Metrica: 'LIVELLO ESPERIENZA', Valore: '' },
      ...Object.entries(experienceCounts).map(([level, count]) => ({
        Metrica: EXPERIENCE_TRANSLATIONS[level as keyof typeof EXPERIENCE_TRANSLATIONS],
        Valore: count
      })),
      { Metrica: '', Valore: '' }, // Empty row
      { Metrica: 'TOP POSIZIONI', Valore: '' },
      ...Object.entries(positionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([position, count]) => ({
          Metrica: position,
          Valore: count
        }))
    ]

    // Create workbook
    const workbook = createStyledWorkbook(summaryData, 'Riepilogo')
    
    // Generate filename
    const defaultFilename = `riepilogo_candidati_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`
    const finalFilename = filename || defaultFilename

    // Write file
    XLSX.writeFile(workbook, `${finalFilename}.xlsx`)

  } catch (error) {
    console.error('Summary export error:', error)
    throw new Error(`Errore durante l'esportazione del riepilogo: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
  }
}

// Utility function to validate export options
export function validateExportOptions(options: ExportOptions): string[] {
  const errors: string[] = []
  
  if (options.format && !['xlsx', 'csv'].includes(options.format)) {
    errors.push('Formato non supportato. Utilizzare "xlsx" o "csv".')
  }
  
  if (options.filename && !/^[a-zA-Z0-9_-]+$/.test(options.filename)) {
    errors.push('Il nome del file può contenere solo lettere, numeri, underscore e trattini.')
  }
  
  if (options.includeColumns && options.includeColumns.length === 0) {
    errors.push('Se specificate, le colonne da includere non possono essere vuote.')
  }
  
  return errors
}

// Get available export columns
export function getAvailableColumns(): Array<{ key: string; label: string }> {
  return Object.entries(COLUMN_MAPPINGS).map(([key, label]) => ({
    key,
    label
  }))
}
