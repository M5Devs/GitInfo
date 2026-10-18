import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  normalizePath,
  getCurrentRoute,
  navigateTo,
  addRouteListener,
  updateActiveNavLinks,
  initRouter,
} from "../src/router";

describe("SPA Router Module", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav>
        <a href="/" data-nav-link="/">Inspect</a>
        <a href="/compare" data-nav-link="/compare">Compare</a>
        <a href="/explore" data-nav-link="/explore">Explore</a>
        <a href="/apps" data-nav-link="/apps">Apps</a>
        <a href="/compare" id="plain-link">Plain Compare Link</a>
        <a href="https://external.com" id="external-link" target="_blank">External</a>
      </nav>
      <main>
        <div id="inspect-view" class="view-container flex"></div>
        <div id="compare-view" class="view-container hidden"></div>
        <div id="explore-view" class="view-container hidden"></div>
        <div id="apps-view" class="view-container hidden"></div>
      </main>
    `;
    window.history.replaceState({}, "", "/");
  });

  it("normalizes paths correctly", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/compare")).toBe("/compare");
    expect(normalizePath("/compare/")).toBe("/compare");
    expect(normalizePath("/explore")).toBe("/explore");
    expect(normalizePath("/explore/")).toBe("/explore");
    expect(normalizePath("/apps")).toBe("/apps");
    expect(normalizePath("/apps/")).toBe("/apps");
    expect(normalizePath("/unknown")).toBe("/");
  });

  it("gets current route and query params", () => {
    window.history.replaceState({}, "", "/compare?a=facebook/react&b=vuejs/core");
    const route = getCurrentRoute();
    expect(route.path).toBe("/compare");
    expect(route.queryParams.get("a")).toBe("facebook/react");
    expect(route.queryParams.get("b")).toBe("vuejs/core");
  });

  it("navigates to route and updates URL", () => {
    const listener = vi.fn();
    addRouteListener(listener);

    navigateTo("/explore");

    expect(window.location.pathname).toBe("/explore");
    expect(listener).toHaveBeenCalledWith({
      path: "/explore",
      queryParams: expect.any(URLSearchParams),
    });
  });

  it("updates active nav link highlights", () => {
    updateActiveNavLinks("/compare");

    const compareLink = document.querySelector('[data-nav-link="/compare"]');
    const inspectLink = document.querySelector('[data-nav-link="/"]');

    expect(compareLink?.classList.contains("bg-indigo-600/20")).toBe(true);
    expect(inspectLink?.classList.contains("bg-indigo-600/20")).toBe(false);
  });

  it("intercepts clicks on data-nav-link links", () => {
    const routeListener = vi.fn();
    initRouter(routeListener);

    const compareLink = document.querySelector('[data-nav-link="/compare"]') as HTMLAnchorElement;
    compareLink.click();

    expect(window.location.pathname).toBe("/compare");
    expect(routeListener).toHaveBeenCalledWith({
      path: "/compare",
      queryParams: expect.any(URLSearchParams),
    });
  });

  it("intercepts clicks on standard internal href links without target=_blank", () => {
    const routeListener = vi.fn();
    initRouter(routeListener);

    const plainLink = document.getElementById("plain-link") as HTMLAnchorElement;
    plainLink.click();

    expect(window.location.pathname).toBe("/compare");
  });

  it("notifies route change listener on initial load for direct URL visits", () => {
    window.history.replaceState({}, "", "/explore");
    const listener = vi.fn();

    initRouter(listener);

    expect(listener).toHaveBeenCalledWith({
      path: "/explore",
      queryParams: expect.any(URLSearchParams),
    });
    const exploreLink = document.querySelector('[data-nav-link="/explore"]');
    expect(exploreLink?.classList.contains("bg-indigo-600/20")).toBe(true);
  });
});
