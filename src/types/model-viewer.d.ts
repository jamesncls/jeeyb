import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";

// <model-viewer> é um custom element (@google/model-viewer); aqui só os atributos que a loja usa.
type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "interaction-prompt"?: "auto" | "none";
  "touch-action"?: "pan-y" | "pan-x" | "none";
  "shadow-intensity"?: number | string;
  "shadow-softness"?: number | string;
  "environment-image"?: string;
  exposure?: number | string;
  style?: CSSProperties;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
