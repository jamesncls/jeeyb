import { useCallback, useEffect, useState } from "react";
import { supabase, Product } from "@/lib/supabase";

export const BRAND_FILTERS = ["Nike", "Jordan", "Adidas", "Streetwear"];

export const CATEGORY_FILTERS = [
  { value: "sneakers", label: "Tênis" },
  { value: "jackets", label: "Casacos" },
  { value: "accessories", label: "Acessórios" },
];

// Uma única busca por carregamento de página, compartilhada entre as seções da home.
let productsRequest: Promise<Product[]> | null = null;

function fetchProducts() {
  if (!productsRequest) {
    productsRequest = (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    })();
    productsRequest.catch(() => {
      productsRequest = null;
    });
  }
  return productsRequest;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  return { products, status, retry };
}
