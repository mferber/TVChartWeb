import * as e from "express";

export function fadeOutVertically(element: HTMLElement, durationSec: number): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = '';
    requestAnimationFrame(() => {
      element.style.height = element.clientHeight + 'px';
      element.style.transition = `height ${durationSec}s, margin-bottom ${durationSec}s, opacity ${durationSec}s`;
      requestAnimationFrame(() => {
        element.style.height = '0';
        element.style.opacity = '0';
        element.style.marginBottom = '0';

        element.addEventListener('transitionend', e => {
          const callee = arguments.callee as (this: HTMLElement, ev: TransitionEvent) => any;
          element.removeEventListener('transitionend', callee);
          resolve();
        });
      });
    });
  });
}

