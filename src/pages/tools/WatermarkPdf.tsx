import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Upload, Download, X, ArrowLeft, Droplet, Image as ImageIcon, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { toast } from "sonner";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

type WatermarkType = "text" | "image";
type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function WatermarkPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("center");
  const [opacity, setOpacity] = useState([0.3]);
  const [rotation, setRotation] = useState([45]);
  const [fontSize, setFontSize] = useState([48]);
  const [textColor, setTextColor] = useState("#000000");
  const [applyToAllPages, setApplyToAllPages] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    setPdfFile(file);
    setWatermarkedBlob(null);
    toast.success("PDF uploaded successfully");
  }, []);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setWatermarkImage(file);
    toast.success("Watermark image uploaded successfully");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback(() => {
    setPdfFile(null);
    setWatermarkedBlob(null);
  }, []);

  const getPositionCoordinates = (pageWidth: number, pageHeight: number, contentWidth: number, contentHeight: number) => {
    const padding = 50;
    switch (position) {
      case "center":
        return { x: pageWidth / 2, y: pageHeight / 2 };
      case "top-left":
        return { x: padding, y: pageHeight - padding };
      case "top-right":
        return { x: pageWidth - padding, y: pageHeight - padding };
      case "bottom-left":
        return { x: padding, y: padding + contentHeight };
      case "bottom-right":
        return { x: pageWidth - padding, y: padding + contentHeight };
      default:
        return { x: pageWidth / 2, y: pageHeight / 2 };
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };

  const addWatermark = useCallback(async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      toast.error("Please upload a watermark image");
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const pagesToProcess = applyToAllPages ? pages : [pages[0]];

      if (watermarkType === "text") {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const color = hexToRgb(textColor);

        for (const page of pagesToProcess) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize[0]);
          const textHeight = fontSize[0];
          const coords = getPositionCoordinates(width, height, textWidth, textHeight);

          page.drawText(watermarkText, {
            x: coords.x - (position === "center" ? textWidth / 2 : 0),
            y: coords.y - (position === "center" ? textHeight / 2 : 0),
            size: fontSize[0],
            font: font,
            color: rgb(color.r, color.g, color.b),
            opacity: opacity[0],
            rotate: degrees(rotation[0]),
          });
        }
      } else if (watermarkType === "image" && watermarkImage) {
        const imageBytes = await watermarkImage.arrayBuffer();
        const imageType = watermarkImage.type;
        
        let embeddedImage;
        if (imageType === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else if (imageType === 'image/jpeg' || imageType === 'image/jpg') {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          toast.error("Please use PNG or JPG images");
          setIsProcessing(false);
          return;
        }

        const imageDims = embeddedImage.scale(0.5);

        for (const page of pagesToProcess) {
          const { width, height } = page.getSize();
          const coords = getPositionCoordinates(width, height, imageDims.width, imageDims.height);

          page.drawImage(embeddedImage, {
            x: coords.x - (position === "center" ? imageDims.width / 2 : 0),
            y: coords.y - (position === "center" ? imageDims.height / 2 : 0),
            width: imageDims.width,
            height: imageDims.height,
            opacity: opacity[0],
            rotate: degrees(rotation[0]),
          });
        }
      }

      const watermarkedPdfBytes = await pdfDoc.save();
      const blob = new Blob([watermarkedPdfBytes as BlobPart], { type: 'application/pdf' });
      setWatermarkedBlob(blob);

      toast.success("Watermark added successfully!");
    } catch (error) {
      console.error("Watermark error:", error);
      toast.error("Failed to add watermark. Please ensure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, watermarkType, watermarkText, watermarkImage, position, opacity, rotation, fontSize, textColor, applyToAllPages]);

  const downloadWatermarked = useCallback(() => {
    if (!watermarkedBlob || !pdfFile) return;

    const url = URL.createObjectURL(watermarkedBlob);
    const timestamp = new Date().toISOString().slice(0, 10);
    const originalName = pdfFile.name.replace('.pdf', '');
    const filename = `${originalName}-watermarked-${timestamp}.pdf`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Watermarked PDF downloaded!");
  }, [watermarkedBlob, pdfFile]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I upload my logo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can upload any image (PNG or JPG) as a watermark. Simply select the Image tab and upload your logo. You can adjust its size, position, opacity, and rotation to match your needs."
        }
      },
      {
        "@type": "Question",
        "name": "Can I set transparency?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Use the opacity slider to control watermark transparency from 0% (invisible) to 100% (fully opaque). We recommend 20-40% opacity for subtle, professional-looking watermarks."
        }
      },
      {
        "@type": "Question",
        "name": "Will watermark repeat on all pages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You have full control! Choose to apply the watermark to all pages or just the first page. This is useful for different scenarios like branding entire documents or marking cover pages only."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Add Watermark to PDF – Online Free Tool | TheBulletinBriefs</title>
        <meta
          name="description"
          content="Add text or image watermarks to PDF documents. Free and simple. Customize position, opacity, and rotation."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thebulletinbriefs.in/tools/add-watermark/" />
        
        <meta property="og:title" content="Add Watermark to PDF – Online Free Tool | TheBulletinBriefs" />
        <meta property="og:description" content="Add text or image watermarks to PDF documents. Free and simple." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thebulletinbriefs.in/tools/add-watermark/" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Add Watermark to PDF – Online Free Tool | TheBulletinBriefs" />
        <meta name="twitter:description" content="Add text or image watermarks to PDF documents. Free and simple." />
        
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/tools">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Droplet className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Add Watermark to PDF
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Protect your content by adding customizable watermarks.
            </p>
          </div>

          {/* Main Watermark Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
              <CardDescription>
                Select a PDF file and add text or image watermark
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop Zone */}
              {!pdfFile && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Drop PDF file here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF file to add watermark
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>
              )}

              {/* PDF Preview & Watermark Controls */}
              {pdfFile && !watermarkedBlob && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Watermark Type Tabs */}
                  <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as WatermarkType)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">
                        <Type className="w-4 h-4 mr-2" />
                        Text Watermark
                      </TabsTrigger>
                      <TabsTrigger value="image">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image Watermark
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="watermark-text">Watermark Text</Label>
                        <Input
                          id="watermark-text"
                          type="text"
                          placeholder="Enter watermark text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          maxLength={50}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="font-size">Font Size: {fontSize[0]}px</Label>
                        <Slider
                          id="font-size"
                          value={fontSize}
                          onValueChange={setFontSize}
                          min={12}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text-color">Text Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <span className="text-sm text-muted-foreground">{textColor}</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="watermark-image">Upload Watermark Image</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          {watermarkImage ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">{watermarkImage.name}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWatermarkImage(null)}
                              >
                                Remove Image
                              </Button>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm mb-2">Click to upload logo/image</p>
                              <input
                                id="watermark-image"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                className="hidden"
                                onChange={(e) => handleImageSelect(e.target.files)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('watermark-image')?.click()}
                              >
                                Choose Image
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Supports PNG and JPG formats</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Common Controls */}
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                    <h3 className="font-semibold">Watermark Settings</h3>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                        <SelectTrigger id="position">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opacity">Opacity: {(opacity[0] * 100).toFixed(0)}%</Label>
                      <Slider
                        id="opacity"
                        value={opacity}
                        onValueChange={setOpacity}
                        min={0.1}
                        max={1}
                        step={0.05}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rotation">Rotation: {rotation[0]}°</Label>
                      <Slider
                        id="rotation"
                        value={rotation}
                        onValueChange={setRotation}
                        min={-180}
                        max={180}
                        step={5}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="apply-all"
                        checked={applyToAllPages}
                        onChange={(e) => setApplyToAllPages(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="apply-all" className="cursor-pointer">
                        Apply watermark to all pages
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={addWatermark}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    <Droplet className="mr-2 h-5 w-5" />
                    {isProcessing ? "Adding Watermark..." : "Add Watermark"}
                  </Button>
                </div>
              )}

              {/* Watermark Success */}
              {watermarkedBlob && pdfFile && (
                <div className="space-y-4">
                  <div className="p-6 border border-green-500/50 rounded-lg bg-green-500/10 text-center">
                    <Droplet className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-semibold text-lg mb-2">Watermark Added Successfully!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your PDF now has a custom watermark
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={downloadWatermarked}
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Watermarked PDF
                    </Button>
                    <Button
                      onClick={removeFile}
                      variant="outline"
                      size="lg"
                    >
                      Add Another
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Text & Image</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add text watermarks or upload your own logo.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fully Customizable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Control position, opacity, rotation, and more.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Apply watermark to all pages or just the first.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">100% Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All processing happens in your browser securely.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How to Use */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Add Watermark to PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Your PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Click or drag and drop your PDF file into the upload area.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customize Watermark</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose text or image watermark, adjust position, opacity, rotation, and other settings.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Watermark" and download your protected PDF file instantly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <h3 className="text-xl font-semibold mb-2">Can I upload my logo?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upload any image (PNG or JPG) as a watermark. Simply select the Image tab and upload your logo. You can adjust its size, position, opacity, and rotation to match your needs.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="text-xl font-semibold mb-2">Can I set transparency?</h3>
                <p className="text-muted-foreground">
                  Absolutely! Use the opacity slider to control watermark transparency from 0% (invisible) to 100% (fully opaque). We recommend 20-40% opacity for subtle, professional-looking watermarks.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="text-xl font-semibold mb-2">Will watermark repeat on all pages?</h3>
                <p className="text-muted-foreground">
                  You have full control! Choose to apply the watermark to all pages or just the first page. This is useful for different scenarios like branding entire documents or marking cover pages only.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
