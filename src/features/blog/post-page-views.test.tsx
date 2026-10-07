import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

const state = vi.hoisted(() => ({
  post: undefined as unknown,
  increment: vi.fn(),
}));

vi.mock("@/store/api/publicApi", () => ({
  useGetBlogPostBySlugQuery: () => ({
    data: state.post,
    isLoading: false,
    isError: false,
  }),
  useGetSiteIdentityQuery: () => ({ data: undefined }),
  useIncrementPostViewMutation: () => [state.increment],
}));
// The count only happens against a real database, in production.
vi.mock("@/lib/config", async (original) => ({
  ...(await original<typeof import("@/lib/config")>()),
  isSupabaseConfigured: true,
}));
vi.mock("./post-content-loader", () => ({
  loadPostContent: () => new Promise(() => {}),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => null }));
vi.mock("next/dynamic", () => ({
  default: () => () => <div>body</div>,
}));

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver ??=
  NoopObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;

const { PostPage } = await import("./post-page");

const post = (extra = {}) => ({
  id: "p1",
  slug: "hello",
  title: "Hello",
  content: "Body",
  views: 10,
  ...extra,
});

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.useFakeTimers();
  state.increment.mockClear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  state.post = undefined;
});

describe("a post's view count", () => {
  it("is not raised by a visit shorter than five seconds", () => {
    state.post = post();
    const view = render(<PostPage slug="hello" />);
    vi.advanceTimersByTime(4000);
    view.unmount();
    vi.advanceTimersByTime(4000);
    expect(state.increment).not.toHaveBeenCalled();
  });

  it("is raised once when the reader stays", () => {
    state.post = post();
    render(<PostPage slug="hello" />);
    vi.advanceTimersByTime(6000);
    expect(state.increment).toHaveBeenCalledTimes(1);
    expect(state.increment).toHaveBeenCalledWith("p1");
  });

  it("is still raised once when the post comes back with the new count", () => {
    // Counting a view invalidates the post, which returns as a new object
    // with views + 1. That must not start another five-second timer: a
    // reader who stays a minute is one view, not twelve.
    state.post = post();
    const view = render(<PostPage slug="hello" />);
    vi.advanceTimersByTime(6000);
    for (let n = 11; n < 16; n += 1) {
      state.post = post({ views: n });
      view.rerender(<PostPage slug="hello" />);
      vi.advanceTimersByTime(6000);
    }
    expect(state.increment).toHaveBeenCalledTimes(1);
  });
});
