declare module "react/jsx-runtime" {
  export const Fragment: any;
  export const jsx: any;
  export const jsxs: any;
}

declare module "react/jsx-dev-runtime" {
  export const Fragment: any;
  export const jsx: any;
  export const jsxs: any;
}

// Ambient fallbacks for this workspace when `node_modules` typings
// are unavailable to the editor. These keep TS from failing on
// `react/jsx-runtime` and basic TSX usage.
declare module "react" {
  export type ReactNode = any;
  export function useState<S>(
    initialState: S | (() => S)
  ): [S, (next: S | ((prev: S) => S)) => void];
  export function useEffect(effect: any, deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
}

declare module "next/navigation" {
  export function useRouter(): any;
  export function useSearchParams(): { get: (name: string) => string | null };
}

declare module "lucide-react" {
  export const ArrowRight: any;
  export const Eye: any;
  export const EyeOff: any;
  export const Lock: any;
  export const Mail: any;
  export const User: any;
  export const Menu: any;
  export const X: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};

