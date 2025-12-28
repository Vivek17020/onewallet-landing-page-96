import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Mail, ExternalLink, Blocks, Wrench, FileText, Shield, Scale, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";



export const UPSCFooter = () => {
  // Fetch categories with article counts dynamically
  const { data: categoriesWithCounts = [] } = useQuery({
    queryKey: ['upsc-footer-categories'],
    queryFn: async () => {
      // Get UPSC parent category
      const { data: upscParent } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'upscbriefs')
        .single();

      if (!upscParent) return [];

      // Get subcategories with article counts
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('parent_id', upscParent.id);

      if (!subcategories) return [];

      // Get article counts for each category
      const categoriesWithArticleCounts = await Promise.all(
        subcategories.map(async (cat) => {
          const { count } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('published', true);
          
          return {
            ...cat,
            articleCount: count || 0
          };
        })
      );

      // Show all categories - sort by article count and limit to top 8
      return categoriesWithArticleCounts
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 8); // Limit to top 8 categories
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/upscbriefs" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">UPSCBriefs</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              UPSC Preparation Made Simple. Clear, concise, and exam-oriented study material 
              for IAS, IPS, and Civil Services aspirants.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@thebulletinbriefs.in" className="hover:text-white transition-colors">
                contact@thebulletinbriefs.in
              </a>
            </div>
          </div>

          {/* Subjects - Show all categories */}
          {categoriesWithCounts.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4">Subjects</h3>
              <ul className="space-y-2">
                {categoriesWithCounts.slice(0, 5).map((category) => (
                  <li key={category.slug}>
                    <Link
                      to={`/upscbriefs/${category.slug}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* More Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">More</h3>
            <ul className="space-y-2">
              {/* Show remaining categories if any */}
              {categoriesWithCounts.slice(5).map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/upscbriefs/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/upscbriefs/about"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/upscbriefs/contact"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  The Bulletin Briefs <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  to="/web3forindia"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Blocks className="w-3 h-3" /> Web3ForIndia
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3" /> Free Tools
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-4">
            <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" /> Privacy Policy
            </Link>
            <span className="text-gray-700">|</span>
            <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1">
              <Scale className="w-3 h-3" /> Terms of Service
            </Link>
            <span className="text-gray-700">|</span>
            <Link to="/disclaimer" className="hover:text-white transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3" /> Disclaimer
            </Link>
          </div>
          <p className="text-center text-gray-500">© {new Date().getFullYear()} UPSCBriefs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
