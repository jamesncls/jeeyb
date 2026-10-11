"use client";

import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { Rotate3d } from "lucide-react";
import { ProductImage } from "@/components/shop/ProductImage";
import { Interactive360Video } from "./Interactive360Video";

const VIDEO_360 = "video-360";

// Quadro do produto: um quadrado que cabe na coluna da esquerda e na altura do palco.
const MEDIA_FRAME = "w-[min(100%,calc(var(--stage-h)-6rem))] aspect-square";
const TEXT_SHADOW = "[text-shadow:0_1px_12px_rgba(0,0,0,0.9)]";

// Cor de fundo da foto (pixel do canto) e se ela é clara. É com ela que o fundo da foto
// continua pela tela toda. Foto de fundo transparente, ou de outro domínio (canvas bloqueado),
// fica sem preenchimento.
function sampleBackground(image: HTMLImageElement) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 2, 2, 1, 1, 0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    if (a <= 250) return null;
    return { color: `rgb(${r}, ${g}, ${b})`, light: 0.299 * r + 0.587 * g + 0.114 * b > 140 };
  } catch {
    return null;
  }
}

interface ProductSceneProps {
  images: string[];
  name: string;
  video360Url?: string | null;
  // "← Catálogo", no canto superior esquerdo do palco.
  breadcrumb: ReactNode;
  // Coluna de informações (nome, preço, compra), flutuando à direita.
  children: ReactNode;
}

// Cena da página de produto, sem caixas e sem recorte:
//   - o FUNDO é contínuo e cobre a tela inteira: com vídeo 360°, o primeiro quadro dele bem
//     desfocado (a fumaça do estúdio de ponta a ponta); com foto, a cor de fundo da própria foto;
//   - o PRODUTO fica nítido, menor, na esquerda; a coluna dele inteira arrasta o giro 360°;
//   - o texto (children) flutua na direita, legível por um gradiente linear aplicado só no fundo.
//   --stage-h: altura da coluna do produto (metade da tela no mobile, a tela toda no desktop)
export function ProductScene({ images, name, video360Url, breadcrumb, children }: ProductSceneProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const handleVideoError = useCallback(() => setVideoFailed(true), []);

  const hasVideo = !!video360Url && !videoFailed;
  const media = hasVideo ? [VIDEO_360, ...images] : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[Math.min(activeIndex, Math.max(media.length - 1, 0))];
  const showingVideo = hasVideo && active === VIDEO_360;

  // Guardado junto com a foto de onde veio: trocar de foto zera o fundo até a nova carregar.
  const [photoBackground, setPhotoBackground] = useState<{
    src: string;
    fill: ReturnType<typeof sampleBackground>;
  } | null>(null);
  const fill = !showingVideo && photoBackground?.src === active ? photoBackground.fill : null;
  const lightScene = !!fill?.light;

  return (
    <section
      className="relative isolate overflow-x-clip transition-colors duration-500 lg:bg-(--scene-fill) [--stage-h:50svh] lg:[--stage-h:max(600px,calc(100svh-5rem))]"
      style={fill ? ({ "--scene-fill": fill.color } as CSSProperties) : undefined}
    >
      {/* FUNDO: preso na tela enquanto a seção rola; não recebe cliques */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="sticky top-16 md:top-20 h-[calc(100svh-4rem)] md:h-[calc(100svh-5rem)] overflow-hidden">
          {showingVideo && video360Url && (
            <video
              // #t: mostra o primeiro quadro sem tocar. Parado, não custa decodificação.
              src={`${video360Url}#t=0.001`}
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              tabIndex={-1}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl brightness-50 saturate-150"
            />
          )}

          {/* Gradiente linear só no fundo: escurece o lado do texto. Com foto de fundo claro ele
              começa depois do produto e sobe mais rápido, senão o texto branco não se lê. */}
          {lightScene ? (
            <div className="hidden lg:block absolute inset-y-0 right-0 w-[59%] bg-linear-to-l from-background via-background/95 via-[81%] to-transparent" />
          ) : (
            <div className="hidden lg:block absolute inset-0 bg-linear-to-l from-background via-background/80 to-transparent" />
          )}
          <div className="lg:hidden absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
        </div>
      </div>

      <div className="lg:flex">
        {/* PRODUTO: no mobile o fundo da foto preenche este bloco e se dissolve embaixo */}
        <div className="relative h-(--stage-h) px-4 sm:px-6 max-lg:bg-(--scene-fill) transition-colors duration-500 lg:w-[45%] lg:shrink-0 lg:self-start lg:sticky lg:top-20 lg:pl-8 lg:pr-0">
          <div className="relative h-full">
            {showingVideo && video360Url ? (
              <Interactive360Video
                src={video360Url}
                label={`Giro 360° de ${name}`}
                poster={images[0]}
                onError={handleVideoError}
                mediaClassName={`${MEDIA_FRAME} object-cover edge-feather`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`relative ${MEDIA_FRAME}`}>
                  <div className="absolute inset-[9%]">
                    <ProductImage
                      key={active}
                      src={active}
                      alt={name}
                      sizes="(min-width: 1024px) 40vw, 80vw"
                      className="object-contain!"
                      priority
                      onLoad={(image) => setPhotoBackground({ src: active, fill: sampleBackground(image) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Canto superior esquerdo: navegação + selo do 360°, só texto */}
            <div
              className={`absolute top-4 left-0 lg:top-6 flex flex-col items-start gap-2 pointer-events-none ${
                lightScene ? "text-background" : `text-fg ${TEXT_SHADOW}`
              }`}
            >
              <div className="pointer-events-auto">{breadcrumb}</div>
              {showingVideo && (
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-wine-glow">
                  <span className="w-1.5 h-1.5 bg-wine-glow rounded-full animate-pulse" aria-hidden />
                  [ 360° INTERATIVO ]
                </span>
              )}
            </div>

            {/* Miniaturas: trocam a mídia do palco */}
            {media.length > 1 && (
              <ul className="absolute inset-x-0 bottom-2 lg:bottom-6 z-10 flex justify-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {media.map((item, index) => {
                  const selected = item === active;
                  const isVideo = hasVideo && item === VIDEO_360;
                  return (
                    <li key={item} className="shrink-0">
                      <button
                        type="button"
                        aria-label={
                          isVideo ? "Ver giro 360°" : `Ver foto ${hasVideo ? index : index + 1} de ${images.length}`
                        }
                        aria-pressed={selected}
                        onClick={() => setActiveIndex(index)}
                        className={`relative block w-11 h-11 sm:w-12 sm:h-12 rounded-sm overflow-hidden border transition-all duration-300 ${
                          selected
                            ? "border-wine shadow-wine-subtle"
                            : "border-line opacity-70 hover:opacity-100 hover:border-wine/60"
                        }`}
                      >
                        {isVideo ? (
                          <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-background/60 text-wine-glow">
                            <Rotate3d className="w-4 h-4" aria-hidden />
                            <span className="font-mono text-[8px] uppercase tracking-widest text-fg">360°</span>
                          </span>
                        ) : (
                          <ProductImage src={item} alt="" sizes="48px" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Mobile: a base do bloco do produto se dissolve no fundo da página */}
          <div
            aria-hidden
            className="lg:hidden absolute inset-x-0 bottom-0 h-20 pointer-events-none bg-linear-to-t from-background to-transparent"
          />
        </div>

        <div className="flex-1 min-w-0 flex lg:items-center lg:min-h-(--stage-h) px-4 sm:px-6 lg:pl-28 lg:pr-8 pt-6 pb-14 lg:py-10">
          {children}
        </div>
      </div>
    </section>
  );
}
