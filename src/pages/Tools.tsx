import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText, Video, Image, FileDown, Clock, Scissors, Lock, Droplet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  isComingSoon?: boolean;
}

const tools: Tool[] = [
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF Converter",
    description: "Convert JPG images into high-quality PDFs online.",
    icon: <Image className="w-8 h-8" />,
    link: "/tools/jpg-to-pdf",
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts Downloader",
    description: "Download YouTube Shorts videos instantly in HD.",
    icon: <Video className="w-8 h-8" />,
    link: "/tools/youtube-shorts-downloader",
  },
  {
    id: "instagram-video",
    name: "Instagram Video Downloader",
    description: "Save Instagram Reels and videos online for free.",
    icon: <FileDown className="w-8 h-8" />,
    link: "/tools/instagram-video-downloader",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/merge-pdf",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Extract or split pages from PDF files easily.",
    icon: <Scissors className="w-8 h-8" />,
    link: "/tools/split-pdf",
  },
  {
    id: "pdf-compressor",
    name: "PDF Compressor",
    description: "Compress large PDF files while keeping quality.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/compress-pdf",
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    description: "Edit PDF documents with text, shapes, and annotations.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/edit-pdf",
  },
  {
    id: "protect-pdf",
    name: "Protect PDF",
    description: "Add password protection to PDF files with AES-256 encryption.",
    icon: <Lock className="w-8 h-8" />,
    link: "/tools/protect-pdf",
  },
  {
    id: "watermark-pdf",
    name: "Add Watermark to PDF",
    description: "Add text or image watermarks with custom positioning.",
    icon: <Droplet className="w-8 h-8" />,
    link: "/tools/add-watermark",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word Converter",
    description: "Convert PDF to editable Word document.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/pdf-to-word",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF Converter",
    description: "Convert DOCX files to PDF easily.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/word-to-pdf",
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF Converter",
    description: "Convert Excel spreadsheets to PDF format.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/excel-to-pdf",
  },
  {
    id: "ppt-to-pdf",
    name: "PowerPoint to PDF Converter",
    description: "Convert PowerPoint presentations to PDF instantly.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/ppt-to-pdf",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG Converter",
    description: "Extract PDF pages as high-quality JPG images.",
    icon: <Image className="w-8 h-8" />,
    link: "/tools/pdf-to-jpg",
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel Converter",
    description: "Extract tables from PDF to Excel spreadsheet.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/pdf-to-excel",
  },
  {
    id: "pdf-to-ppt",
    name: "PDF to PowerPoint Converter",
    description: "Convert PDFs into editable PowerPoint slides.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/pdf-to-ppt",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate PDF pages by 90°, 180°, or 270° instantly.",
    icon: <FileText className="w-8 h-8" />,
    link: "/tools/rotate-pdf",
  },
];

const faqs = [
  {
    question: "Are these tools free to use?",
    answer: "Yes! All our tools are completely free to use with no hidden charges or subscription fees.",
  },
  {
    question: "Do I need to sign up?",
    answer: "No signup required. You can use all tools instantly without creating an account.",
  },
  {
    question: "Can I use these tools on mobile?",
    answer: "Absolutely! Our tools are fully responsive and work perfectly on all devices including smartphones and tablets.",
  },
  {
    question: "Are my files safe?",
    answer: "Yes, your privacy is our priority. All processing happens securely in your browser, and we don't store any of your files on our servers.",
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

export default function Tools() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Free Online Tools by TheBulletinBriefs – File Converters & Downloaders</title>
        <meta
          name="description"
          content="Access free online tools – JPG to PDF, YouTube Shorts Downloader, Instagram Video Downloader, and more. No signup, fast, and secure."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thebulletinbriefs.in/tools/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Free Online Tools by TheBulletinBriefs – File Converters & Downloaders" />
        <meta property="og:description" content="Access free online tools – JPG to PDF, YouTube Shorts Downloader, Instagram Video Downloader, and more. No signup, fast, and secure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thebulletinbriefs.in/tools/" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Tools by TheBulletinBriefs – File Converters & Downloaders" />
        <meta name="twitter:description" content="Access free online tools – JPG to PDF, YouTube Shorts Downloader, Instagram Video Downloader, and more. No signup, fast, and secure." />
        
        {/* FAQ Schema */}
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 container py-8 md:py-12">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Free Online Tools – Convert, Download & Manage Easily
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to TheBulletinBriefs Tools – your all-in-one collection of free online utilities. 
            Whether you want to convert images, merge PDFs, or download videos from YouTube and Instagram, 
            we've got you covered. All tools are 100% free, fast, and privacy-friendly.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {tool.isComingSoon && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning/20 text-warning-foreground rounded-full">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </span>
                </div>
              )}
              
              <CardHeader>
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {tool.icon}
                </div>
                <CardTitle className="text-xl">{tool.name}</CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {tool.isComingSoon ? (
                  <Button variant="secondary" disabled className="w-full">
                    Coming Soon
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to={tool.link}>Use Tool</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">About Our Tools</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our free tools are built with Lovable and designed for speed, accuracy, and privacy. 
            We don't store your files — everything happens securely in your browser. Whether you're 
            a student, professional, or content creator, our tools help you get work done faster 
            without compromising on quality or security.
          </p>
        </section>

        {/* FAQs Section */}
        <section className="max-w-4xl mx-auto">
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
      </main>

      <Footer />
    </div>
  );
}
