import { supabase } from "@/lib/supabase";

export const MODEL_ACCEPT = ".glb,model/gltf-binary";

// Sobe um modelo 3D (.glb) pro bucket products e devolve a URL pública.
// Quem autoriza o upload é a policy de Storage (só admin), não este código.
export async function uploadProductModel(file: File): Promise<{ url: string } | { error: string }> {
  if (!file.name.toLowerCase().endsWith(".glb")) {
    return { error: "O modelo 3D precisa ser um arquivo .glb (no Polycam: Export → GLB)." };
  }

  const path = `models/${Date.now()}-${Math.random().toString(36).substring(2)}.glb`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { contentType: "model/gltf-binary", cacheControl: "31536000" });

  if (error) {
    return { error: `Não deu pra enviar o modelo 3D: ${error.message}` };
  }
  return { url: supabase.storage.from("products").getPublicUrl(path).data.publicUrl };
}
