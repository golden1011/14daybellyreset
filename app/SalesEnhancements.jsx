"use client";

import { useEffect } from "react";

export default function SalesEnhancements() {
  useEffect(() => {
    const fitHero = () => {
      const hs = document.querySelector(".heroscale");
      if (!hs) return;

      const child = hs.firstElementChild;
      const width = hs.clientWidth;
      if (!child || !width) return;

      const clipLeft = 78;
      const clipTop = 22;
      const clipWidth = 1662;
      const clipHeight = 1064;
      const scale = width / clipWidth;

      child.style.transformOrigin = "top left";
      child.style.transform = `translate(${-clipLeft * scale}px, ${-clipTop * scale}px) scale(${scale})`;
      hs.style.height = `${Math.round(clipHeight * scale)}px`;
    };

    fitHero();
    const timers = [setTimeout(fitHero, 150), setTimeout(fitHero, 600)];

    let observer;
    const hero = document.querySelector(".heroscale");
    if (window.ResizeObserver && hero) {
      observer = new ResizeObserver(fitHero);
      observer.observe(hero);
    }

    window.addEventListener("resize", fitHero);

    const slider = document.getElementById("ba-slider");
    const clip = document.getElementById("ba-clip");
    const line = document.getElementById("ba-line");
    const knob = document.getElementById("ba-knob");
    let dragging = false;

    const setSlider = (clientX) => {
      if (!slider || !clip || !line || !knob) return;
      const rect = slider.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const pct = (fraction * 100).toFixed(2);

      clip.style.clipPath = `inset(0 ${(100 - fraction * 100).toFixed(2)}% 0 0)`;
      line.style.left = `${pct}%`;
      knob.style.left = `${pct}%`;
    };

    const onPointerDown = (event) => {
      dragging = true;
      slider?.setPointerCapture?.(event.pointerId);
      setSlider(event.clientX);
    };
    const onPointerMove = (event) => {
      if (!dragging) return;
      setSlider(event.clientX);
      if (event.cancelable) event.preventDefault();
    };
    const stopDragging = () => {
      dragging = false;
    };

    slider?.addEventListener("pointerdown", onPointerDown);
    slider?.addEventListener("pointermove", onPointerMove);
    slider?.addEventListener("pointerup", stopDragging);
    slider?.addEventListener("pointercancel", stopDragging);

    return () => {
      timers.forEach(clearTimeout);
      observer?.disconnect();
      window.removeEventListener("resize", fitHero);
      slider?.removeEventListener("pointerdown", onPointerDown);
      slider?.removeEventListener("pointermove", onPointerMove);
      slider?.removeEventListener("pointerup", stopDragging);
      slider?.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  return null;
}
