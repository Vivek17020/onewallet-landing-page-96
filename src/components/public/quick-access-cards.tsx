import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Briefcase, GraduationCap, Code, Wrench, ArrowRight } from "lucide-react";

const quickAccessItems = [
  {
    title: "UPSC Preparation",
    description: "Daily briefs, quizzes, flashcards & PYQ practice",
    icon: BookOpen,
    href: "/upscbriefs",
    gradient: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "Government Jobs",
    description: "Latest Sarkari Naukri & exam notifications",
    icon: Briefcase,
    href: "/category/jobs",
    gradient: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "Education News",
    description: "Board results, admit cards & scholarship updates",
    icon: GraduationCap,
    href: "/category/education",
    gradient: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "Web3 Learning",
    description: "Blockchain tutorials, courses & certifications",
    icon: Code,
    href: "/web3forindia",
    gradient: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    title: "Free Tools",
    description: "PDF, Image & Video converters for students",
    icon: Wrench,
    href: "/tools",
    gradient: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
];

export function QuickAccessCards() {
  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">For Students</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} to={item.href} className="group">
              <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Arrow */}
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
