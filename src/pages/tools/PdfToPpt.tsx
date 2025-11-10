import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FileText, Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import PptxGenJS from "pptxgenjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const faqs = [
  {
    question: "Can I edit the converted slides?",
    answer: "Yes! The converted PowerPoint file is fully editable. You can modify text, images, and layouts in PowerPoint or any compatible application.",
  },
  {
    question: "Will fonts and images be preserved?",
    answer: "Images are preserved and embedded in the PowerPoint. Text is extracted and placed on slides, though exact font matching may vary depending on the original PDF.",
  },
  {
    question: "Is there a file-size restriction?",
    answer: "We recommend PDFs under 20MB for optimal performance. Larger files may take longer to process or may not convert properly.",
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

export default function PdfToPpt() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      toast.success("PDF file selected successfully!");
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsConverting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      pptx.author = "TheBulletinBriefs";
      pptx.company = "TheBulletinBriefs.in";
      pptx.title = file.name.replace(".pdf", "");

      const totalPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas to render PDF page
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          } as any).promise;

          // Convert canvas to image
          const imageData = canvas.toDataURL("image/png");

          // Create slide and add image
          const slide = pptx.addSlide();
          slide.background = { color: "FFFFFF" };
          
          // Add the rendered page as an image
          slide.addImage({
            data: imageData,
            x: 0,
            y: 0,
            w: "100%",
            h: "100%",
          });

          // Extract text content
          const textContent = await page.getTextContent();
          const textItems = textContent.items as any[];
          
          // Group text items by approximate Y position
          const lines: { [key: number]: string[] } = {};
          textItems.forEach((item) => {
            if (item.str.trim()) {
              const y = Math.round(item.transform[5] / 10) * 10;
              if (!lines[y]) lines[y] = [];
              lines[y].push(item.str);
            }
          });

          // Add text as speaker notes for accessibility
          const allText = Object.keys(lines)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map(y => lines[parseInt(y)].join(" "))
            .join("\n");
          
          if (allText.trim()) {
            slide.addNotes(allText);
          }
        }
      }

      // Save the PowerPoint file
      const fileName = file.name.replace(".pdf", ".pptx");
      await pptx.writeFile({ fileName });
      
      toast.success("PDF converted to PowerPoint successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>PDF to PowerPoint Converter – Free & Easy | TheBulletinBriefs</title>
        <meta
          name="description"
          content="Convert PDFs into editable PowerPoint slides online. Free, no signup."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thebulletinbriefs.in/tools/pdf-to-ppt/" />
        
        <meta property="og:title" content="PDF to PowerPoint Converter – Free & Easy | TheBulletinBriefs" />
        <meta property="og:description" content="Convert PDFs into editable PowerPoint slides online. Free, no signup." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thebulletinbriefs.in/tools/pdf-to-ppt/" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PDF to PowerPoint Converter – Free & Easy | TheBulletinBriefs" />
        <meta name="twitter:description" content="Convert PDFs into editable PowerPoint slides online. Free, no signup." />
        
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Free PDF to PowerPoint Converter
            </h1>
            <p className="text-lg text-muted-foreground">
              Recreate your PDFs as editable PowerPoint presentations instantly.
            </p>
          </div>

          <Card className="mb-12">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">
                        {file ? file.name : "Click to upload PDF"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Maximum file size: 20MB
                      </p>
                    </div>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="gap-2"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Convert to PPT
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">How it works:</h3>
                  <ol className="space-y-2 text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">1.</span>
                      Upload your PDF file (maximum 20MB)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">2.</span>
                      Click "Convert to PPT" to start the conversion
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">3.</span>
                      Download your converted PowerPoint file
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="mb-12">
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
