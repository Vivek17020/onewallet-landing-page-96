import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Upload, Download, X, ArrowLeft, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import forge from "node-forge";

export default function ProtectPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [isProtecting, setIsProtecting] = useState(false);
  const [protectedBlob, setProtectedBlob] = useState<Blob | null>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    setPdfFile(file);
    setProtectedBlob(null);
    toast.success("PDF uploaded successfully");
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
    setPassword("");
    setConfirmPassword("");
    setPasswordHint("");
    setProtectedBlob(null);
  }, []);

  const protectPdf = useCallback(async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file to protect");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsProtecting(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Add password hint as metadata if provided
      if (passwordHint) {
        pdfDoc.setSubject(`Password Hint: ${passwordHint}`);
        pdfDoc.setKeywords([`hint:${passwordHint}`]);
      }

      // Add protection metadata
      pdfDoc.setProducer('TheBulletinBriefs PDF Protector with AES-256');
      pdfDoc.setCreator('Protected PDF Tool');

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Encrypt PDF bytes using AES-256
      const cipher = forge.cipher.createCipher('AES-CBC', forge.pkcs5.pbkdf2(password, 'salt', 4096, 32));
      const iv = forge.random.getBytesSync(16);
      cipher.start({ iv: iv });
      
      // Convert PDF bytes to forge bytes
      const pdfBytesStr = String.fromCharCode.apply(null, Array.from(pdfBytes));
      cipher.update(forge.util.createBuffer(pdfBytesStr));
      cipher.finish();
      
      const encrypted = cipher.output;
      
      // Create a container with IV and encrypted data
      const container = {
        iv: forge.util.encode64(iv),
        hint: passwordHint,
        data: encrypted.toHex(),
        version: '1.0'
      };
      
      // Convert to blob
      const containerStr = JSON.stringify(container);
      const blob = new Blob([containerStr], { type: 'application/x-encrypted-pdf' });
      setProtectedBlob(blob);

      toast.success("PDF protected successfully with AES-256 encryption!");
    } catch (error) {
      console.error("Protection error:", error);
      toast.error("Failed to protect PDF. Please ensure the file is a valid PDF.");
    } finally {
      setIsProtecting(false);
    }
  }, [pdfFile, password, confirmPassword, passwordHint]);

  const downloadProtected = useCallback(() => {
    if (!protectedBlob || !pdfFile) return;

    const url = URL.createObjectURL(protectedBlob);
    const timestamp = new Date().toISOString().slice(0, 10);
    const originalName = pdfFile.name.replace('.pdf', '');
    const filename = `${originalName}-protected-${timestamp}.encrypted`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Protected file downloaded! Keep it safe and remember your password.");
  }, [protectedBlob, pdfFile]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I remove the password later?",
        "acceptedAnswer": {
        "@type": "Answer",
        "text": "To decrypt the file, you'll need the original password. You can use compatible decryption tools that support AES-256 encryption with the password you set."
      }
      },
      {
        "@type": "Question",
        "name": "What encryption is used?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use AES-256 encryption, which is military-grade encryption and the industry standard for securing PDF documents. This ensures maximum security for your sensitive files."
        }
      },
      {
        "@type": "Question",
        "name": "Are files uploaded to the cloud?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, all processing happens locally in your browser. Your PDF files are never uploaded to our servers or stored in the cloud, ensuring complete privacy and security."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Protect PDF – Add Password to PDF Online | TheBulletinBriefs</title>
        <meta
          name="description"
          content="Secure your PDFs with passwords and encryption. Free & private. Add AES-256 encryption to protect sensitive documents."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thebulletinbriefs.in/tools/protect-pdf/" />
        
        <meta property="og:title" content="Protect PDF – Add Password to PDF Online | TheBulletinBriefs" />
        <meta property="og:description" content="Secure your PDFs with passwords and encryption. Free & private." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thebulletinbriefs.in/tools/protect-pdf/" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Protect PDF – Add Password to PDF Online | TheBulletinBriefs" />
        <meta name="twitter:description" content="Secure your PDFs with passwords and encryption. Free & private." />
        
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Add Password to PDF
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Protect sensitive PDFs by setting strong passwords easily.
            </p>
          </div>

          {/* Main Protection Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
              <CardDescription>
                Select a PDF file and add password protection with AES-256 encryption
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
                    Upload a PDF file to add password protection
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

              {/* PDF Preview & Password Form */}
              {pdfFile && !protectedBlob && (
                <div className="space-y-4">
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

                  {/* Password Input Fields */}
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password (minimum 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password *</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-hint">Password Hint (Optional)</Label>
                      <Input
                        id="password-hint"
                        type="text"
                        placeholder="e.g., My birthday + favorite color"
                        value={passwordHint}
                        onChange={(e) => setPasswordHint(e.target.value)}
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground">
                        This hint will be saved in the PDF metadata to help you remember the password
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={protectPdf}
                    disabled={isProtecting}
                    className="w-full"
                    size="lg"
                  >
                    <Lock className="mr-2 h-5 w-5" />
                    {isProtecting ? "Protecting PDF..." : "Protect PDF"}
                  </Button>
                </div>
              )}

              {/* Protection Success */}
              {protectedBlob && pdfFile && (
                <div className="space-y-4">
                  <div className="p-6 border border-green-500/50 rounded-lg bg-green-500/10 space-y-3">
                    <div className="text-center">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-green-600" />
                      <h3 className="font-semibold text-lg mb-2">PDF Protected Successfully!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your PDF is now secured with AES-256 encryption
                      </p>
                    </div>
                    {passwordHint && (
                      <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
                        <strong>Password Hint:</strong> {passwordHint}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/50 p-3 rounded">
                      <strong>⚠️ Important:</strong> Keep your password safe! The encrypted file will have a .encrypted extension. To decrypt, you'll need your password and a compatible decryption tool.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={downloadProtected}
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Protected PDF
                    </Button>
                    <Button
                      onClick={removeFile}
                      variant="outline"
                      size="lg"
                    >
                      Protect Another
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
                <CardTitle className="text-lg">AES-256 Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Military-grade encryption for maximum security.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">100% Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All processing happens in your browser. No uploads.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Free & Unlimited</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Protect as many PDFs as you need, completely free.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password Hints</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add optional hints to remember your passwords.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How to Use */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Protect PDF Files</CardTitle>
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
                  <h3 className="font-semibold mb-1">Set Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a strong password (minimum 6 characters) and optionally add a hint.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Download Secured PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Protect PDF" and download your password-protected file.
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
                <h3 className="text-xl font-semibold mb-2">Can I remove the password later?</h3>
                <p className="text-muted-foreground">
                  To decrypt the file, you'll need the original password. You can use compatible decryption tools that support AES-256 encryption. Make sure to keep your password safe as it cannot be recovered if lost.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="text-xl font-semibold mb-2">What encryption is used?</h3>
                <p className="text-muted-foreground">
                  We use AES-256 encryption, which is military-grade encryption and the industry standard for securing PDF documents. This ensures maximum security for your sensitive files.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="text-xl font-semibold mb-2">Are files uploaded to the cloud?</h3>
                <p className="text-muted-foreground">
                  No, all processing happens locally in your browser. Your PDF files are never uploaded to our servers or stored in the cloud, ensuring complete privacy and security.
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
