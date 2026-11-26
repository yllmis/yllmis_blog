import { GitHubStore } from "./github-store";
import { LocalFsStore } from "./local-store";
import type { ContentStore } from "./types";

export type { ContentItem, ContentMeta, ContentStore, ContentType, SaveContentInput } from "./types";
export { StoreConflictError } from "./github-store";
export { countWords, validateContentType, validateSlug } from "./markdown";
export { extractToc } from "./toc";
export type { TocItem } from "./toc";

export function getContentStore(): ContentStore {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";

  if (token && owner && repo) {
    return new GitHubStore({ token, owner, repo, branch });
  }

  return new LocalFsStore();
}
