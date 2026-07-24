import { jsPDF } from 'jspdf'

const PAGE = {
  marginX: 22,
  top: 24,
  bottom: 22,
  width: 166,
}

function cleanMarkdown(value) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
    .trim()
}

export default function exportLegalPdf({ title, content, filename, metadata = [] }) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageHeight = pdf.internal.pageSize.getHeight()
  let y = PAGE.top

  const addPageNumber = () => {
    const page = pdf.internal.getNumberOfPages()
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(100)
    pdf.text(`Page ${page}`, 105, pageHeight - 10, { align: 'center' })
  }

  const ensureSpace = (needed) => {
    if (y + needed <= pageHeight - PAGE.bottom) return
    addPageNumber()
    pdf.addPage()
    y = PAGE.top
  }

  pdf.setFont('times', 'bold')
  pdf.setFontSize(17)
  pdf.setTextColor(20)
  pdf.text(title.toUpperCase(), 105, y, { align: 'center' })
  y += 8
  pdf.setDrawColor(80)
  pdf.setLineWidth(0.3)
  pdf.line(PAGE.marginX, y, 210 - PAGE.marginX, y)
  y += 8

  metadata.filter((item) => item.value).forEach((item) => {
    ensureSpace(7)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(55)
    pdf.text(`${item.label}:`, PAGE.marginX, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(String(item.value), PAGE.marginX + 31, y)
    y += 6
  })

  if (metadata.some((item) => item.value)) y += 3

  const paragraphs = cleanMarkdown(content).split(/\n{2,}/)
  paragraphs.forEach((paragraph) => {
    const isHeading = paragraph.length < 90 && !/[.!?]$/.test(paragraph) && !paragraph.includes('\n')
    const lines = pdf.splitTextToSize(paragraph, PAGE.width)
    const lineHeight = isHeading ? 6 : 5.2
    ensureSpace(lines.length * lineHeight + 5)

    pdf.setFont('times', isHeading ? 'bold' : 'normal')
    pdf.setFontSize(isHeading ? 12 : 11)
    pdf.setTextColor(25)
    pdf.text(lines, PAGE.marginX, y, { lineHeightFactor: 1.35 })
    y += lines.length * lineHeight + (isHeading ? 4 : 3)
  })

  ensureSpace(18)
  y += 3
  pdf.setDrawColor(160)
  pdf.line(PAGE.marginX, y, 210 - PAGE.marginX, y)
  y += 6
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.setTextColor(100)
  const disclaimer = pdf.splitTextToSize(
    'AI-generated draft for review. Verify all facts, dates, names, legal provisions, and blank fields with a qualified legal professional before use.',
    PAGE.width,
  )
  pdf.text(disclaimer, PAGE.marginX, y, { lineHeightFactor: 1.35 })

  addPageNumber()
  pdf.save(filename)
}
