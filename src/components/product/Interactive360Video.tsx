"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MoveHorizontal } from "lucide-react";

// Arrastar a largura inteira do viewer = uma volta completa (o vídeo é um giro de 360°).
const TURNS_PER_WIDTH = 1;
// 1: arrastar pra direita avança o vídeo. Troque pra -1 se os vídeos forem gravados girando pro outro lado.
const DRAG_DIRECTION = 1;
// Passo das setas do teclado, em fração de volta.
const KEY_STEP = 1 / 36;
// Folga pro fim do arquivo: buscar exatamente a duração cai num quadro "terminado".
const END_MARGIN = 0.05;

interface Interactive360VideoProps {
  src: string;
  label: string;
  // Foto mostrada enquanto o vídeo carrega.
  poster?: string;
  onError: () => void;
  // Classes do <video>: tamanho e enquadramento do produto dentro da área de arrasto.
  mediaClassName?: string;
  // Classes da linha da dica ("Arraste para girar"), pra alinhar com o produto quando ele não está no centro.
  hintClassName?: string;
}

// Giro 360° controlado pelo dedo/mouse: o vídeo nunca toca sozinho, o arrasto horizontal
// é que move o currentTime. A área de arrasto preenche o container pai inteiro; o vídeo fica
// centralizado dentro dela, no tamanho que `mediaClassName` der.
export function Interactive360Video({
  src,
  label,
  poster,
  onError,
  mediaClassName = "w-full h-full object-cover",
  hintClassName = "",
}: Interactive360VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startTime: number } | null>(null);
  // Tempo pedido pelo arrasto. Só o mais recente importa: se o vídeo ainda está buscando o
  // anterior, este espera o `seeked` em vez de empilhar buscas (é o que evita o lag).
  const targetTime = useRef<number | null>(null);
  const primed = useRef(false);

  // "Pronto" = já dá pra buscar quadros. Lido direto do <video>: ele vem no HTML do servidor e
  // pode carregar (ou falhar) antes de o React ligar os eventos, então um onLoadedMetadata se perderia.
  const subscribeReady = useCallback((notify: () => void) => {
    const video = videoRef.current;
    if (!video) return () => {};
    video.addEventListener("loadedmetadata", notify);
    return () => video.removeEventListener("loadedmetadata", notify);
  }, []);
  const ready = useSyncExternalStore(
    subscribeReady,
    () => (videoRef.current?.readyState ?? 0) >= HTMLMediaElement.HAVE_METADATA,
    () => false
  );
  const [interacted, setInteracted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const applyTarget = useCallback(() => {
    const video = videoRef.current;
    if (!video || targetTime.current === null || video.seeking) return;
    video.currentTime = targetTime.current;
    targetTime.current = null;
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const span = Math.max(video.duration - END_MARGIN, 0.01);
      // Dá a volta: passou do fim, recomeça; antes do início, vai pro fim.
      targetTime.current = ((time % span) + span) % span;
      applyTarget();
    },
    [applyTarget]
  );

  // Mesmo motivo do `ready`: se o arquivo já tinha falhado antes da hidratação, avisa agora.
  useEffect(() => {
    if (videoRef.current?.error) onError();
  }, [onError]);

  // iOS só decodifica quadros depois de um play: um play/pause no primeiro toque destrava o scrub.
  function prime(video: HTMLVideoElement) {
    if (primed.current) return;
    primed.current = true;
    const started = video.play();
    if (started) started.then(() => video.pause()).catch(() => {});
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || (e.pointerType === "mouse" && e.button !== 0)) return;
    prime(video);
    // Captura: o arrasto continua valendo mesmo se o ponteiro sair de cima do viewer.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ponteiro já encerrado: segue sem captura
    }
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startTime: video.currentTime };
    setDragging(true);
    setInteracted(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const video = videoRef.current;
    const current = drag.current;
    if (!video || !current || current.pointerId !== e.pointerId) return;
    const width = e.currentTarget.clientWidth || 1;
    const turns = ((e.clientX - current.startX) / width) * TURNS_PER_WIDTH * DRAG_DIRECTION;
    seekTo(current.startTime + turns * video.duration);
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    prime(video);
    setInteracted(true);
    const step = (e.key === "ArrowRight" ? 1 : -1) * KEY_STEP * DRAG_DIRECTION;
    seekTo((targetTime.current ?? video.currentTime) + step * video.duration);
  }

  return (
    <div
      role="group"
      aria-label={`${label}. Arraste para os lados ou use as setas do teclado para girar.`}
      aria-roledescription="visualizador 360 graus"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      // pan-y: o arrasto horizontal gira o produto e o vertical continua rolando a página no celular.
      className={`absolute inset-0 flex items-center justify-center touch-pan-y select-none outline-none focus-visible:ring-1 focus-visible:ring-wine/60 ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <video
        ref={videoRef}
        // #t: faz o primeiro quadro aparecer sem dar play.
        src={`${src}#t=0.001`}
        poster={poster}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        draggable={false}
        aria-hidden
        onSeeked={applyTarget}
        onError={onError}
        className={`pointer-events-none ${mediaClassName}`}
      />

      {/* Dica: aparece quando o vídeo carrega e some na primeira interação. Sem caixa, só texto. */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-[14%] flex justify-center pointer-events-none transition-opacity duration-500 ${hintClassName} ${
          ready && !interacted ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-fg [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
          <MoveHorizontal className="w-4 h-4 text-wine-glow animate-pulse" />
          Arraste para girar em 360°
        </span>
      </div>

      {!ready && (
        <p
          aria-hidden
          className={`absolute inset-x-0 bottom-[14%] flex justify-center font-mono text-[10px] uppercase tracking-widest text-fg/60 animate-pulse pointer-events-none ${hintClassName}`}
        >
          {"// CARREGANDO 360°..."}
        </p>
      )}
    </div>
  );
}
