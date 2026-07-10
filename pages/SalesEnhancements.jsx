"use client";

import { useEffect } from "react";

const stripeBuyUrl = "https://buy.stripe.com/7sY28qgK42d2062aDZ4Ni0f";

function createEventId(eventName) {
  const random = Math.random().toString(36).slice(2);
  return `${eventName.toLowerCase()}-${Date.now()}-${random}`;
}

function getCookie(name) {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split("=").slice(1).join("=")) : undefined;
}

function fbcFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

function trackAddToCart() {
  const eventName = "AddToCart";
  const eventId = createEventId(eventName);

  window.fbq?.("track", eventName, {}, { eventID: eventId });

  return fetch("/api/meta-conversion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc") || fbcFromUrl(),
      customData: {}
    }),
    keepalive: true
  }).catch(() => {});
}

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
    const range = document.getElementById("ba-range");
    let dragging = false;

    const applySliderFraction = (fraction) => {
      if (!clip || !line || !knob) return;
      const clamped = Math.max(0, Math.min(1, fraction));
      const pct = (clamped * 100).toFixed(2);

      clip.style.clipPath = `inset(0 ${(100 - clamped * 100).toFixed(2)}% 0 0)`;
      line.style.left = `${pct}%`;
      knob.style.left = `${pct}%`;
    };

    const setSlider = (clientX) => {
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const fraction = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0, Math.min(1, fraction));

      applySliderFraction(clamped);
      if (range) range.value = String(Math.round(clamped * 100));
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
    const onRangeInput = () => {
      applySliderFraction(Number(range?.value || 50) / 100);
    };

    let redirectingToStripe = false;
    const onCtaClick = (event) => {
      const link = event.target?.closest?.("a");
      if (!link?.href?.startsWith(stripeBuyUrl)) return;

      trackAddToCart();

      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
      if (event.defaultPrevented || isModifiedClick || redirectingToStripe) return;

      redirectingToStripe = true;
      event.preventDefault();
      window.setTimeout(() => {
        window.location.href = link.href;
      }, 350);
    };

    document.addEventListener("click", onCtaClick, true);

    slider?.addEventListener("pointerdown", onPointerDown);
    slider?.addEventListener("pointermove", onPointerMove);
    slider?.addEventListener("pointerup", stopDragging);
    slider?.addEventListener("pointercancel", stopDragging);
    range?.addEventListener("input", onRangeInput);

    return () => {
      timers.forEach(clearTimeout);
      observer?.disconnect();
      window.removeEventListener("resize", fitHero);
      document.removeEventListener("click", onCtaClick, true);
      slider?.removeEventListener("pointerdown", onPointerDown);
      slider?.removeEventListener("pointermove", onPointerMove);
      slider?.removeEventListener("pointerup", stopDragging);
      slider?.removeEventListener("pointercancel", stopDragging);
      range?.removeEventListener("input", onRangeInput);
    };
  }, []);

  return null;
}
