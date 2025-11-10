import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Upload, RotateCw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { toast } from "sonner";
import { PDFDocument, degrees } from "pdf-lib";

interface PageRotation {
  pageNumber: number;
  rotation: number;
}

const faqs = [
  {
    question: "Can I rotate multiple pages at once?",
    answer: "Yes! You can rotate individual pages, select multiple pages, or rotate all pages at once with a single click.",
  },
  {
    question: "Does the quality of my PDF change after rotation?",
    answer: "No, the quality remains exactly the same. We only change the orientation of pages without re-encoding or compressing your PDF.",
  },
  {
    question: "Is this tool free to use?",
    answer: "Yes, our PDF rotation tool is completely free with no file size limits or usage restrictions.",
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

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      return;
    }

    setFile(selectedFile);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      
      const rotations: PageRotation[] = [];
      for (let i = 0; i < count; i++) {
        rotations.push({ pageNumber: i + 1, rotation: 0 });
      }
      setPageRotations(rotations);
      toast.success(`PDF loaded with ${count} pages`);
    } catch (error) {
      toast.error("Failed to load PDF");
      console.error(error);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
  };

  const selectAllPages = () => {
    const allPages = new Set<number>();
    for (let i = 1; i <= pageCount; i++) {
      allPages.add(i);
    }
    setSelectedPages(allPages);
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  const rotateSelected = (rotationDegrees: number) => {
    if (selectedPages.size === 0) {
      toast.error("Please select at least one page to rotate");
      return;
    }

    const newRotations = pageRotations.map((pr) => {
      if (selectedPages.has(pr.pageNumber)) {
        return {
          ...pr,
          rotation: (pr.rotation + rotationDegrees) % 360,
        };
      }
      return pr;
    });
    setPageRotations(newRotations);
    toast.success(`Rotated ${selectedPages.size} page(s) by ${rotationDegrees}°`);
  };

  const rotateAllPages = (rotationDegrees: number) => {
    const newRotations = pageRotations.map((pr) => ({
      ...pr,
      rotation: (pr.rotation + rotationDegrees) % 360,
    }));
    setPageRotations(newRotations);
    toast.success(`Rotated all pages by ${rotationDegrees}°`);
  };

  const handleDownload = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      pageRotations.forEach((pr) => {
        if (pr.rotation !== 0) {
          const page = pdfDoc.getPage(pr.pageNumber - 1);
          page.setRotation(degrees(pr.rotation));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_rotated.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDF rotated and downloaded successfully!");
    } catch (error) {
      toast.error("Failed to rotate PDF");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Rotate PDF Online – Free Tool | TheBulletinBriefs</title>
        <meta
          name="description"
          content="Rotate PDF pages in any direction instantly. 100% secure. Rotate individual pages or entire document by 90°, 180°, or 270°."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thebulletinbriefs.in/tools/rotate-pdf/" />
        
        <meta property="og:title" content="Rotate PDF Online – Free Tool | TheBulletinBriefs" />
        <meta property="og:description" content="Rotate PDF pages in any direction instantly. 100% secure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thebulletinbriefs.in/tools/rotate-pdf/" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rotate PDF Online – Free Tool | TheBulletinBriefs" />
        <meta name="twitter:description" content="Rotate PDF pages in any direction instantly. 100% secure." />
        
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Rotate PDF Pages Online
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Easily rotate any PDF page or the entire document. Choose from 90°, 180°, or 270° rotation options.
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
              <CardDescription>
                Select a PDF file to rotate pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF files only
                    </p>
                  </label>
                </div>

                {file && pageCount > 0 && (
                  <>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={selectAllPages} variant="outline" size="sm">
                          Select All
                        </Button>
                        <Button onClick={deselectAllPages} variant="outline" size="sm">
                          Deselect All
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {pageRotations.map((pr) => (
                          <button
                            key={pr.pageNumber}
                            onClick={() => togglePageSelection(pr.pageNumber)}
                            className={`aspect-[3/4] border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                              selectedPages.has(pr.pageNumber)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="text-xs font-medium">Page {pr.pageNumber}</span>
                            {pr.rotation !== 0 && (
                              <span className="text-xs text-muted-foreground">{pr.rotation}°</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Rotate Selected Pages:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => rotateSelected(90)} variant="outline" size="sm">
                            <RotateCw className="w-4 h-4 mr-2" />
                            90°
                          </Button>
                          <Button onClick={() => rotateSelected(180)} variant="outline" size="sm">
                            <RotateCw className="w-4 h-4 mr-2" />
                            180°
                          </Button>
                          <Button onClick={() => rotateSelected(270)} variant="outline" size="sm">
                            <RotateCw className="w-4 h-4 mr-2" />
                            270°
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Rotate All Pages:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => rotateAllPages(90)} variant="secondary" size="sm">
                            <RotateCw className="w-4 h-4 mr-2" />
                            All 90°
                          </Button>
                          <Button onClick={() => rotateAllPages(180)} variant="secondary" size="sm">
                            <RotateCw className="w-4 h-4 mr-2" />
                            All 180°
                          </Button>
                          <Button onClick={() => rotateAllPages(270)} variant="secondary" size="sm">
                            <RotateCw className="w-4 h-4 mr-2" />
                            All 270°
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={handleDownload}
                        disabled={processing}
                        className="w-full"
                        size="lg"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Rotated PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-4">How to Rotate PDF Pages</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Step 1:</strong> Upload your PDF file by clicking the upload area or dragging and dropping.
              </p>
              <p>
                <strong>Step 2:</strong> Select the pages you want to rotate by clicking on them, or use "Select All" to rotate all pages.
              </p>
              <p>
                <strong>Step 3:</strong> Choose your rotation angle (90°, 180°, or 270°) for selected pages or all pages.
              </p>
              <p>
                <strong>Step 4:</strong> Click "Download Rotated PDF" to save your rotated document.
              </p>
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
