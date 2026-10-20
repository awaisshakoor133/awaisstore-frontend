import { useEffect } from "react";

const DEFAULT_TITLE = "Awais Mobile-Zone — Premium Shopping";
const DEFAULT_DESCRIPTION =
  "Premium shopping experience for mobile phones, smartwatches & accessories in Pakistan. Free shipping, COD available.";

export function useSEO({ title, description, image, url, type = "website" }) {
  useEffect(() => {
    // Title
    document.title = title || DEFAULT_TITLE;

    // Helper to set/create meta tag
    const setMeta = (attr, attrValue, content) => {
      let tag = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Description
    setMeta("name", "description", description || DEFAULT_DESCRIPTION);

    // Open Graph (Facebook, WhatsApp, LinkedIn)
    setMeta("property", "og:title", title || DEFAULT_TITLE);
    setMeta(
      "property",
      "og:description",
      description || DEFAULT_DESCRIPTION
    );
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "Awais Mobile-Zone");
    if (image) setMeta("property", "og:image", image);
    if (url) {
      setMeta("property", "og:url", url);
      setMeta("property", "og:image:width", "1200");
      setMeta("property", "og:image:height", "630");
    }

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title || DEFAULT_TITLE);
    setMeta(
      "name",
      "twitter:description",
      description || DEFAULT_DESCRIPTION
    );
    if (image) setMeta("name", "twitter:image", image);

    // Canonical URL (avoid duplicate content)
    let canonical = document.querySelector('link[rel="canonical"]');
    if (url) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
    } else if (canonical) {
      canonical.remove();
    }
  }, [title, description, image, url, type]);
}