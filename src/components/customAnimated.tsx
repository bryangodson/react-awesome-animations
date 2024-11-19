import React, { useEffect, useState, ReactNode, FC } from "react";
// TypeScript extension to allow special CSS values like 'inherit', 'initial', and 'revert'
type CustomCSSProperties = React.CSSProperties & {
  [key: string]: string | number | "inherit" | "initial" | "revert";
};

export interface AnimationProps {
  /**
   * Initial CSS properties for the animation.
   * @example { transform: "translateX(-100%)" }
   */
  from?: CustomCSSProperties;

  /**
   * Final CSS properties for the animation.
   * @example { transform: "translateX(0)" }
   */
  to?: CustomCSSProperties;

  /**
   * Duration of the animation in milliseconds.
   * @default 500
   */
  duration?: number;

  /**
   * Delay before the animation starts in milliseconds.
   * @default 0
   */
  delay?: number;

  /**
   * Easing function for the animation (e.g., "ease", "linear").
   * @default "ease"
   */
  easing?: string;

  /**
   * Optional custom CSS class for animations.
   * If provided, `from` and `to` will be ignored.
   */
  className?: string;

  /**
   * Custom keyframes definition. If provided, it generates a dynamic animation.
   * @example "0% { transform: translateX(-100%); } 100% { transform: translateX(0); }"
   */
  keyframes?: string;

  /**
   * Content to animate.
   */
  children: ReactNode;
}

/**
 * Base animated component to apply animations to children.
 * @param from - Initial CSS properties for the animation.
 * @param to - Final CSS properties for the animation.
 * @param duration - Duration of the animation in milliseconds.
 * @param delay - Delay before the animation starts in milliseconds.
 * @param easing - Easing function for the animation (e.g., "ease", "linear").
 * @param className - Optional custom CSS class for animations.
 * @param keyframes - Custom keyframes definition for dynamic animations.
 * @param children - Content to animate.
 * @returns JSX.Element
 */
export const CustomAnimated: FC<AnimationProps> = ({
  from,
  to,
  duration = 500,
  delay = 0,
  easing = "ease",
  className,
  keyframes,
  children,
}) => {
  const [style, setStyle] = useState<CustomCSSProperties>(from || {});
  const animationName = keyframes ? generateKeyframes(keyframes) : undefined;

  // UseEffect hook to handle animation calculations
  useEffect(() => {
    if (!className && from && to) {
      let start: number | null = null;

      // Step function to interpolate the 'from' and 'to' CSS properties
      const step = (timestamp: number) => {
        if (!start) start = timestamp;

        const progress = Math.min((timestamp - start - delay) / duration, 1);
        if (progress >= 0) {
          const newStyle: CustomCSSProperties = {};

          // Interpolate between 'from' and 'to' CSS properties
          Object.keys(from).forEach((key) => {
            const startValue = parseFloat(
              from[key as keyof CustomCSSProperties] as string
            );
            const endValue = parseFloat(
              to[key as keyof CustomCSSProperties] as string
            );

            // Interpolate only for numerical properties (e.g., 'width', 'height')
            if (!isNaN(startValue) && !isNaN(endValue)) {
              newStyle[key as keyof CustomCSSProperties] =
                `${startValue + progress * (endValue - startValue)}px`;
            }
            // Handle non-numerical values (e.g., 'color', 'background')
            else if (from[key] !== to[key]) {
              newStyle[key as keyof CustomCSSProperties] = to[key] as string;
            }
          });

          setStyle(newStyle);
        }

        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }
  }, [from, to, duration, delay, className]);

  // Return the wrapped content with animation applied
  return (
    <div
      style={
        className
          ? undefined
          : { ...style, transition: `${duration}ms ${easing}` }
      }
      className={className || animationName}>
      {children}
    </div>
  );
};

/**
 * Generate dynamic keyframes and attach them to the document.
 * @param keyframes - Keyframes definition as a string.
 * @returns Name of the generated animation.
 */
const generateKeyframes = (keyframes: string): string => {
  const name = `custom-${Math.random().toString(36).substring(2, 15)}`;

  // Create a <style> element dynamically and append to the document
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes ${name} { ${keyframes} }
    .${name} { animation: ${name}; }
  `;
  document.head.appendChild(style);

  return name;
};
