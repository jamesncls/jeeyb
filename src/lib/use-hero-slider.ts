import { useEffect, useReducer } from "react";

interface SliderState {
  // Vídeos que existem de fato, na ordem do carrossel.
  videos: string[];
  // Selecionado pelo usuário (é o que os indicadores mostram).
  active: string;
  // O que está visível agora: só troca quando o novo já pode tocar, pra o crossfade não passar pelo vazio.
  shown: string;
  // Já selecionados alguma vez: só esses têm <video> montado (não baixa vídeo que ninguém pediu).
  mounted: string[];
  ready: string[];
}

type SliderAction =
  | { type: "available"; videos: string[] }
  | { type: "select"; src: string }
  | { type: "ready"; src: string }
  | { type: "failed"; src: string };

const withItem = (list: string[], item: string) => (list.includes(item) ? list : [...list, item]);

function select(state: SliderState, src: string): SliderState {
  return {
    ...state,
    active: src,
    mounted: withItem(state.mounted, src),
    shown: state.ready.includes(src) ? src : state.shown,
  };
}

function reducer(state: SliderState, action: SliderAction): SliderState {
  switch (action.type) {
    case "available": {
      const next = { ...state, videos: action.videos };
      return action.videos.includes(state.active) || action.videos.length === 0 ? next : select(next, action.videos[0]);
    }
    case "select":
      return state.videos.includes(action.src) ? select(state, action.src) : state;
    case "ready": {
      const ready = withItem(state.ready, action.src);
      return { ...state, ready, shown: action.src === state.active ? action.src : state.shown };
    }
    case "failed": {
      const videos = state.videos.filter((src) => src !== action.src);
      const next = { ...state, videos, mounted: state.mounted.filter((src) => src !== action.src) };
      if (state.active !== action.src || videos.length === 0) return next;
      const index = state.videos.indexOf(action.src);
      return select(next, videos[index % videos.length]);
    }
  }
}

// Estado do carrossel de vídeos da hero. `sources` precisa ser uma lista estável (constante).
export function useHeroSlider(sources: string[]) {
  const [state, dispatch] = useReducer(reducer, sources, (all): SliderState => {
    const first = all.slice(0, 1);
    return { videos: first, active: first[0] ?? "", shown: first[0] ?? "", mounted: first, ready: [] };
  });

  // Confere quais arquivos existem (o primeiro é carregado direto pelo <video>).
  useEffect(() => {
    if (sources.length < 2) return;
    let active = true;
    Promise.all(
      sources.map((src, index) =>
        index === 0
          ? true
          : fetch(src, { method: "HEAD" }).then(
              (response) => response.ok,
              () => false
            )
      )
    ).then((exists) => {
      if (active) dispatch({ type: "available", videos: sources.filter((_, index) => exists[index]) });
    });
    return () => {
      active = false;
    };
  }, [sources]);

  const { videos } = state;
  const activeIndex = Math.max(videos.indexOf(state.active), 0);
  const selectIndex = (index: number) => {
    if (videos.length === 0) return;
    dispatch({ type: "select", src: videos[(index + videos.length) % videos.length] });
  };

  return {
    count: videos.length,
    activeIndex,
    active: state.active,
    shown: state.shown,
    mounted: state.mounted,
    goTo: selectIndex,
    next: () => selectIndex(activeIndex + 1),
    previous: () => selectIndex(activeIndex - 1),
    markReady: (src: string) => dispatch({ type: "ready", src }),
    markFailed: (src: string) => dispatch({ type: "failed", src }),
  };
}
