import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Briefcase, Code, ArrowRight } from "lucide-react";

export function StudentHeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary py-12 px-6 md:py-16 md:px-12 mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <GraduationCap className="h-5 w-5 text-white" />
          <span className="text-sm font-medium text-white">India's #1 Student News Portal</span>
        </div>
        
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Your Gateway to
          <span className="block mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Academic Success
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          One-stop destination for UPSC Preparation, Government Jobs, Education News & Career Guidance for students and aspirants across India.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all group"
          >
            <Link to="/upscbriefs">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore UPSC Briefs
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Link to="/category/jobs">
              <Briefcase className="mr-2 h-5 w-5" />
              Browse Jobs
            </Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Link to="/web3forindia">
              <Code className="mr-2 h-5 w-5" />
              Learn Web3
            </Link>
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">50K+</div>
            <div className="text-sm text-white/70">Daily Readers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">1000+</div>
            <div className="text-sm text-white/70">Study Materials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-white/70">Job Updates/Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
            <div className="text-sm text-white/70">News Coverage</div>
          </div>
        </div>
      </div>
    </section>
  );
}
