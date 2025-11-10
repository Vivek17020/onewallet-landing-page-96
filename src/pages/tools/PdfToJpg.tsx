import { useState, useRef } from "react";
import { Upload, FileText, Download, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { AdvancedSEOHead } from "@/components/seo/advanced-seo-head";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

const faqs = [
  {
    question: "Can I download all pages at once?",
    answer: "Yes! You can download individual pages or click 'Download All as ZIP' to get all pages in a single compressed file.",
  },
  {
    question: "Are image qualities reduced?",
    answer: "No, we export high-quality JPG images at 2x resolution (1440px width) to ensure crisp, clear results.",
  },
  {
    question: "Is my PDF safe?",
    answer: "Absolutely! All processing happens in your browser. Your PDF never leaves your device, ensuring complete privacy.",
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

interface PagePreview {
  pageNumber: number;
  imageUrl: string;
  blob: Blob;
}

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(pdf)$/i)) {
        toast.error("Please upload a PDF file");
        return;
      }
      setFile(selectedFile);
      setPages([]);
      processPdf(selectedFile);
    }
  };

  const processPdf = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      toast.info(`Processing ${pageCount} pages...`);

      const pagePromises: Promise<PagePreview>[] = [];

      for (let i = 0; i < pageCount; i++) {
        pagePromises.push(renderPage(arrayBuffer, i));
      }

      const renderedPages = await Promise.all(pagePromises);
      setPages(renderedPages);
      toast.success(`${pageCount} pages ready to download!`);
    } catch (error) {
      console.error("PDF processing error:", error);
      toast.error("Failed to process PDF. Please try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const renderPage = async (pdfData: ArrayBuffer, pageIndex: number): Promise<PagePreview> => {
    // Use PDF.js via dynamic import for rendering
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(pageIndex + 1);

    const scale = 2; // 2x for high quality
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
    });

    const imageUrl = URL.createObjectURL(blob);

    return {
      pageNumber: pageIndex + 1,
      imageUrl,
      blob,
    };
  };

  const downloadPage = (page: PagePreview) => {
    const link = document.createElement("a");
    link.href = page.imageUrl;
    link.download = `${file?.name.replace(/\.[^/.]+$/, "")}-page-${page.pageNumber}.jpg`;
    link.click();
    toast.success(`Page ${page.pageNumber} downloaded!`);
  };

  const downloadAllAsZip = async () => {
    if (pages.length === 0) return;

    toast.info("Creating ZIP file...");
    const zip = new JSZip();

    pages.forEach((page) => {
      zip.file(
        `${file?.name.replace(/\.[^/.]+$/, "")}-page-${page.pageNumber}.jpg`,
        page.blob
      );
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(/\.[^/.]+$/, "")}-all-pages.zip`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("All pages downloaded as ZIP!");
  };

  const reset = () => {
    pages.forEach((page) => URL.revokeObjectURL(page.imageUrl));
    setPages([]);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdvancedSEOHead
        title="PDF to JPG Converter – Convert PDF Pages to Images | TheBulletinBriefs"
        description="Extract pages from PDF as high-quality JPG images. Free, secure, no signup."
        canonical="https://www.thebulletinbriefs.in/tools/pdf-to-jpg"
        schemas={[faqSchema]}
      />

      <Navbar />

      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Free PDF to JPG Converter
            </h1>
            <p className="text-lg text-muted-foreground">
              Turn PDF pages into JPG images in seconds — no watermark.
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
                    <p className="font-medium">Processing PDF pages...</p>
                  </div>
                )}

                {pages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-lg">
                        {pages.length} {pages.length === 1 ? "Page" : "Pages"} Ready
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={downloadAllAsZip} variant="default" size="lg">
                          <Download className="w-4 h-4 mr-2" />
                          Download All as ZIP
                        </Button>
                        <Button onClick={reset} variant="outline" size="lg">
                          Upload New PDF
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {pages.map((page) => (
                        <Card key={page.pageNumber} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative aspect-[3/4] bg-muted">
                              <img
                                src={page.imageUrl}
                                alt={`Page ${page.pageNumber}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="p-3 space-y-2">
                              <p className="text-sm font-medium text-center">
                                Page {page.pageNumber}
                              </p>
                              <Button
                                onClick={() => downloadPage(page)}
                                variant="secondary"
                                size="sm"
                                className="w-full"
                              >
                                <Download className="w-3 h-3 mr-2" />
                                Download JPG
                              </Button>
                            </div>
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
                    Select your PDF file from your device
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Preview Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    See all pages rendered as high-quality JPG images
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Save individual pages or download all as ZIP
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
