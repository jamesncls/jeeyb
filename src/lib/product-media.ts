import { supabase } from "@/lib/supabase";

export const VIDEO_360_ACCEPT = ".mp4,.webm,video/mp4,video/webm";

const VIDEO_360_TYPES: Record<string, string> = { mp4: "video/mp4", webm: "video/webm" };
// Limite padrão de upload do Supabase Storage.
const MAX_VIDEO_MB = 50;

// Sobe o vídeo 360° (.mp4/.webm) pro bucket products e devolve a URL pública.
// Quem autoriza o upload é a policy de Storage (só admin), não este código.
export async function uploadProduct360Video(file: File): Promise<{ url: string } | { error: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = VIDEO_360_TYPES[extension];
  if (!contentType) {
    return { error: "O vídeo 360° precisa ser um arquivo .mp4 ou .webm." };
  }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    return { error: `Vídeo grande demais (máx. ${MAX_VIDEO_MB} MB). Um giro curto e comprimido carrega melhor.` };
  }

  const path = `videos-360/${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { contentType, cacheControl: "31536000" });

  if (error) {
    return { error: `Não deu pra enviar o vídeo 360°: ${error.message}` };
  }
  return { url: supabase.storage.from("products").getPublicUrl(path).data.publicUrl };
}
