import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';
import { SEOHead } from '@/utils/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, Target, Award, GraduationCap, BookOpen, Briefcase, FileText, CheckCircle } from 'lucide-react';

export default function AboutUs() {
  return (
    <>
      <SEOHead 
        title="About Us - TheBulletinBriefs | Education News Portal for Students"
        description="TheBulletinBriefs is India's trusted education news portal providing UPSC preparation, government job notifications, exam results, admit cards, scholarships, and career guidance for students."
        canonicalUrl="https://www.thebulletinbriefs.in/about"
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About TheBulletinBriefs</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              India's trusted education news portal empowering students with UPSC preparation, government job updates, exam results, and career guidance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To empower students across India with timely, accurate, and comprehensive educational resources. 
                  We believe every student deserves access to quality study materials, exam updates, and career 
                  guidance to achieve their dreams of serving the nation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Student-First Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Everything we do is designed with students in mind. From UPSC preparation materials and 
                  government job notifications to admit cards and exam results — we provide all the resources 
                  students need to succeed in competitive examinations.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-12" />

          {/* What We Offer Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">UPSC Preparation</h4>
                    <p className="text-sm text-muted-foreground">
                      Free study materials, current affairs briefs, flashcards, and practice quizzes for Civil Services aspirants.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Government Job Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Latest Sarkari Naukri updates from SSC, UPSC, Railways, Banking, Defence, and State PSCs.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Exam Results & Admit Cards</h4>
                    <p className="text-sm text-muted-foreground">
                      Instant updates on exam results, admit card releases, and important exam date announcements.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Previous Year Papers</h4>
                    <p className="text-sm text-muted-foreground">
                      Free access to previous year question papers with solutions for various competitive exams.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Career Guidance</h4>
                    <p className="text-sm text-muted-foreground">
                      Expert advice on career paths, exam strategies, and interview preparation tips.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Free Study Tools</h4>
                    <p className="text-sm text-muted-foreground">
                      PDF converters, image tools, and other utilities to help students with their preparation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                TheBulletinBriefs is powered by a dedicated team of education enthusiasts, former exam toppers, 
                and content creators committed to helping students succeed. Our team understands the challenges 
                of competitive exam preparation and works tirelessly to provide accurate, up-to-date information.
              </p>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Quality Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Exam-focused content curated by subject matter experts and educators.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Daily Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Fresh current affairs and job notifications published daily.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Career Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guidance from exam prep to job placement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-12" />

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Us</h4>
                <p className="text-muted-foreground">
                  Email: contact@thebulletinbriefs.in<br />
                  Phone: +91 8390710252
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-muted-foreground">
                  Maharashtra, India
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Follow Us</h4>
                <p className="text-muted-foreground">
                  Facebook, Twitter, Instagram, YouTube
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
}
