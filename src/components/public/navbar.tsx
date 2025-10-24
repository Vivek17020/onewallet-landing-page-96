import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCategories } from "@/hooks/use-articles";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { SearchDialog } from "@/components/public/search-dialog";
import { UserMenu } from "@/components/public/user-menu";

export function Navbar() {
  const { data: categories } = useCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Filter out Jobs from main categories and get Jobs subcategories
  const mainCategories = categories?.filter(cat => cat.slug !== 'jobs') || [];
  const jobsCategory = categories?.find(cat => cat.slug === 'jobs');
  const jobsSubcategories = jobsCategory?.subcategories || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <img 
            src="/logo.png" 
            alt="TheBulletinBriefs Logo" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            TheBulletinBriefs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" data-no-translate>
          <Link
            to="/"
            className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-all duration-150"
          >
            Home
          </Link>
          
          {mainCategories.map((category) => {
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            
            if (hasSubcategories) {
              return (
                <div key={category.id} className="relative group">
                  <Link
                    to={`/category/${category.slug}`}
                    className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-all duration-150 inline-flex items-center gap-1"
                  >
                    {category.name}
                    <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                  </Link>
                  {/* Dropdown - Instantly visible on hover with no delay */}
                  <div className="absolute top-full left-0 mt-0 w-56 bg-popover/95 backdrop-blur-md border border-border shadow-lg rounded-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-100 z-[100]">
                    <div className="py-1">
                      <Link 
                        to={`/category/${category.slug}`} 
                        className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-sm mx-1 transition-colors"
                      >
                        All {category.name}
                      </Link>
                      {category.subcategories?.map((subcat: any) => (
                        <Link 
                          key={subcat.id} 
                          to={`/category/${category.slug}/${subcat.slug}`}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-accent rounded-sm mx-1 transition-colors"
                        >
                          {subcat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-all duration-150"
              >
                {category.name}
              </Link>
            );
          })}
          
          {/* Jobs Category with Special Handling */}
          {jobsCategory && jobsSubcategories.length > 0 && (
            <div className="relative group">
              <Link
                to="/category/jobs"
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-all duration-150 inline-flex items-center gap-1"
              >
                Jobs
                <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </Link>
              {/* Jobs Dropdown */}
              <div className="absolute top-full left-0 mt-0 w-56 bg-popover/95 backdrop-blur-md border border-border shadow-lg rounded-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-100 z-[100]">
                <div className="py-1">
                  <Link 
                    to="/category/jobs" 
                    className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-sm mx-1 transition-colors"
                  >
                    All Jobs
                  </Link>
                  {jobsSubcategories.map((subcat: any) => (
                    <Link
                      key={subcat.id}
                      to={`/category/jobs/${subcat.slug}`}
                      className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-accent rounded-sm mx-1 transition-colors"
                    >
                      {subcat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="h-9 w-9 p-0"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <UserMenu />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background" data-no-translate>
          <div className="container py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-1">
              <Link
                to="/"
                className="block px-3 py-2.5 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {mainCategories.map((category: any) => (
                <div key={category.id} className="space-y-1">
                  <Link
                    to={`/category/${category.slug}`}
                    className="block px-3 py-2.5 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="pl-4 space-y-1 border-l-2 border-border ml-3">
                      {category.subcategories.map((subcat: any) => (
                        <Link
                          key={subcat.id}
                          to={`/category/${category.slug}/${subcat.slug}`}
                          className="block px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subcat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Jobs in Mobile Menu */}
              {jobsCategory && jobsSubcategories.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-border">
                  <Link
                    to="/category/jobs"
                    className="block px-3 py-2.5 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Jobs
                  </Link>
                  <div className="pl-4 space-y-1 border-l-2 border-border ml-3">
                    {jobsSubcategories.map((subcat: any) => (
                      <Link
                        key={subcat.id}
                        to={`/category/jobs/${subcat.slug}`}
                        className="block px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}