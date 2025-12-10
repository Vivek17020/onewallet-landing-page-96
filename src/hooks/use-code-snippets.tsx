import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CodeSnippet {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  code: string;
  language: string;
  is_public: boolean;
  forked_from: string | null;
  fork_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  slug: string;
}

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
};

export const useCodeSnippets = (isPublic = true) => {
  return useQuery({
    queryKey: ["code-snippets", isPublic],
    queryFn: async () => {
      // Use type assertion for table not in generated types
      let query = (supabase
        .from("web3_code_snippets" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (isPublic) {
        query = query.eq("is_public", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as CodeSnippet[];
    },
  });
};

export const useMyCodeSnippets = () => {
  return useQuery({
    queryKey: ["my-code-snippets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Use type assertion for table not in generated types
      const { data, error } = await (supabase
        .from("web3_code_snippets" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as CodeSnippet[];
    },
  });
};

export const useCodeSnippet = (id: string) => {
  return useQuery({
    queryKey: ["code-snippet", id],
    queryFn: async () => {
      // Use type assertion for table not in generated types
      const { data, error } = await (supabase
        .from("web3_code_snippets" as any)
        .select("*")
        .eq("id", id)
        .single() as any);

      if (error) throw error;

      // Increment view count (ignore errors as function may not exist)
      try {
        await (supabase.rpc as any)("increment_snippet_view_count", { snippet_uuid: id });
      } catch (e) {
        console.log("View count increment not available");
      }

      return data as CodeSnippet;
    },
    enabled: !!id,
  });
};

export const useSaveCodeSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snippet: Partial<CodeSnippet>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save snippets");

      const insertData = {
        title: snippet.title || "",
        description: snippet.description || null,
        code: snippet.code || "",
        language: snippet.language || "solidity",
        is_public: snippet.is_public ?? true,
        forked_from: snippet.forked_from || null,
        user_id: user.id,
        slug: generateSlug(snippet.title || "snippet"),
      };

      // Use type assertion for table not in generated types
      const { data, error } = await (supabase
        .from("web3_code_snippets" as any)
        .insert(insertData)
        .select()
        .single() as any);

      if (error) throw error;
      return data as CodeSnippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-code-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      toast.success("Code snippet saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save snippet: ${error.message}`);
    },
  });
};

export const useUpdateCodeSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...snippet }: Partial<CodeSnippet> & { id: string }) => {
      // Use type assertion for table not in generated types
      const { data, error } = await (supabase
        .from("web3_code_snippets" as any)
        .update(snippet)
        .eq("id", id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as CodeSnippet;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["code-snippet", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-code-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      toast.success("Code snippet updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update snippet: ${error.message}`);
    },
  });
};

export const useForkCodeSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snippet: CodeSnippet) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to fork snippets");

      // Increment fork count on original (ignore errors as function may not exist)
      try {
        await (supabase.rpc as any)("increment_snippet_fork_count", { snippet_uuid: snippet.id });
      } catch (e) {
        console.log("Fork count increment not available");
      }

      // Create fork - use type assertion for table not in generated types
      const { data, error } = await (supabase
        .from("web3_code_snippets" as any)
        .insert({
          title: `${snippet.title} (Fork)`,
          description: snippet.description,
          code: snippet.code,
          language: snippet.language,
          is_public: snippet.is_public,
          forked_from: snippet.id,
          user_id: user.id,
          slug: generateSlug(`${snippet.title} (Fork)`),
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data as CodeSnippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-code-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      toast.success("Code snippet forked successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to fork snippet: ${error.message}`);
    },
  });
};

export const useDeleteCodeSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Use type assertion for table not in generated types
      const { error } = await (supabase
        .from("web3_code_snippets" as any)
        .delete()
        .eq("id", id) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-code-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      toast.success("Code snippet deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete snippet: ${error.message}`);
    },
  });
};
