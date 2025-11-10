import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Download, Loader2, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { AdvancedSEOHead } from "@/components/seo/advanced-seo-head";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const faqs = [
  {
    question: "Does it work for scanned PDFs?",
    answer: "Currently, this tool works best with text-based PDFs. Scanned PDFs (images of documents) may not extract properly.",
  },
  {
    question: "Will formatting stay the same?",
    answer: "We preserve the table structure and numeric data. However, some complex formatting may be simplified for compatibility.",
  },
  {
    question: "Is there any limit?",
    answer: "No file size limit! All processing happens in your browser for complete privacy and security.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

interface TableData {
  pageNumber: number;
  data: string[][];
}

export default function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(pdf)$/i)) {
        toast.error("Please upload a PDF file");
        return;
      }
      setFile(selectedFile);
      setTables([]);
      processPdf(selectedFile);
    }
  };

  const processPdf = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;

      toast.info(`Extracting tables from ${pageCount} pages...`);

      const extractedTables: TableData[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Group text items by their vertical position (y-coordinate)
        const lines: Map<number, Array<{ x: number; text: string }>> = new Map();
        
        textContent.items.forEach((item: any) => {
          if (!item.str.trim()) return;
          
          const y = Math.round(item.transform[5]); // Y position
          const x = Math.round(item.transform[4]); // X position
          
          if (!lines.has(y)) {
            lines.set(y, []);
          }
          
          lines.get(y)!.push({ x, text: item.str.trim() });
        });

        // Sort lines by Y position (top to bottom)
        const sortedLines = Array.from(lines.entries())
          .sort((a, b) => b[0] - a[0]); // Higher Y = top of page

        // Convert to table structure
        const tableData: string[][] = [];
        
        sortedLines.forEach(([_, items]) => {
          // Sort items in each line by X position (left to right)
          const sortedItems = items.sort((a, b) => a.x - b.x);
          const row = sortedItems.map(item => item.text);
          if (row.length > 0) {
            tableData.push(row);
          }
        });

        if (tableData.length > 0) {
          extractedTables.push({
            pageNumber: i,
            data: tableData,
          });
        }
      }

      if (extractedTables.length === 0) {
        toast.error("No tables found in the PDF");
        setProcessing(false);
        return;
      }

      setTables(extractedTables);
      toast.success(`Found ${extractedTables.length} table(s) in the PDF!`);
    } catch (error) {
      console.error("PDF processing error:", error);
      toast.error("Failed to process PDF. Please try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadExcel = () => {
    if (tables.length === 0) return;

    try {
      const workbook = XLSX.utils.book_new();

      tables.forEach((table, index) => {
        const worksheet = XLSX.utils.aoa_to_sheet(table.data);
        
        // Auto-size columns
        const maxWidths: number[] = [];
        table.data.forEach(row => {
          row.forEach((cell, colIndex) => {
            const cellLength = cell.toString().length;
            maxWidths[colIndex] = Math.max(maxWidths[colIndex] || 10, cellLength);
          });
        });
        
        worksheet['!cols'] = maxWidths.map(w => ({ wch: Math.min(w + 2, 50) }));

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          `Page ${table.pageNumber}`
        );
      });

      const fileName = file?.name.replace(/\.[^/.]+$/, "") || "converted";
      XLSX.writeFile(workbook, `${fileName}.xlsx`);

      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to create Excel file");
    }
  };

  const reset = () => {
    setTables([]);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdvancedSEOHead
        title="PDF to Excel Converter – Extract Tables Online | TheBulletinBriefs"
        description="Convert PDF tables to Excel online. Fast, accurate, and free. Extract and edit tables from PDF documents easily."
        canonical="https://www.thebulletinbriefs.in/tools/pdf-to-excel"
        schemas={[faqSchema]}
      />

      <Navbar />

      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Free PDF to Excel Converter
            </h1>
            <p className="text-lg text-muted-foreground">
              Extract and edit tables from PDF documents easily.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : "Click to upload PDF file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF format • Privacy-first, processed locally
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {processing && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="font-medium">Extracting tables from PDF...</p>
                  </div>
                )}

                {tables.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <p className="font-medium text-lg">
                        {tables.length} {tables.length === 1 ? "Table" : "Tables"} Found
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={downloadExcel} variant="default" size="lg">
                          <Download className="w-4 h-4 mr-2" />
                          Download Excel
                        </Button>
                        <Button onClick={reset} variant="outline" size="lg">
                          Upload New PDF
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {tables.map((table, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <TableIcon className="w-4 h-4" />
                              Page {table.pageNumber} - {table.data.length} rows, {table.data[0]?.length || 0} columns
                            </h3>
                            <div className="overflow-x-auto">
                              <div className="inline-block min-w-full">
                                <table className="w-full border-collapse text-sm">
                                  <tbody>
                                    {table.data.slice(0, 5).map((row, rowIndex) => (
                                      <tr key={rowIndex} className={rowIndex === 0 ? "font-semibold bg-muted/50" : ""}>
                                        {row.map((cell, cellIndex) => (
                                          <td
                                            key={cellIndex}
                                            className="border border-border px-3 py-2 whitespace-nowrap"
                                          >
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            {table.data.length > 5 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Showing first 5 rows of {table.data.length}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Upload PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your PDF file containing tables
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <TableIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Extract Tables</h3>
                  <p className="text-sm text-muted-foreground">
                    We automatically detect and extract all tables
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Download Excel</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your data in editable Excel format
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-6 last:border-0">
                  <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
