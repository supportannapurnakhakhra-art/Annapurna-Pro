import Link from "next/link";
import { getBlogs } from "@/lib/shopify";
import shopServices from "@/lib/api/services";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCleanExcerpt } from "@/lib/blogUtils";

export const metadata = {
  title: "Khakhra Parampara | Annapurna Khakhra",
  description: "Stories, recipes & health insights from Annapurna Khakhra.",
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  let articles = [];

  try {
    const backendBlogs = await shopServices.getCmsBlogs();
    const blogHandles = Array.isArray(backendBlogs) && backendBlogs.length > 0
      ? backendBlogs.map((b) => b.handle || "news")
      : ["news"];

    for (const bHandle of blogHandles) {
      const posts = await shopServices.getCmsBlogPosts(bHandle, 1, 50);
      if (Array.isArray(posts)) {
        posts.forEach((post, pIdx) => {
          let imgUrl = post.image_url || post.image?.url || post.image || post.imageUrl || null;
          if (imgUrl && typeof imgUrl === "string" && imgUrl.includes("/media/") && !imgUrl.includes("/api/media/")) {
            imgUrl = imgUrl.replace("/media/", "/api/media/");
          }
          articles.push({
            id: post.id || post._id || `${bHandle}_${post.handle || pIdx}`,
            title: post.title || "Blog Post",
            handle: post.handle || String(post.id || pIdx),
            blogHandle: bHandle,
            excerpt: getCleanExcerpt(post),
            publishedAt: post.published_at || post.publishedAt || post.created_at || null,
            image: { url: imgUrl }
          });
        });
      }
    }
  } catch (err) {
    console.error("Backend CMS blogs fetch failed:", err);
  }

  // Fallback to Shopify if backend returns no articles
  if (!articles.length) {
    try {
      const shopifyBlogs = await getBlogs();
      if (Array.isArray(shopifyBlogs)) {
        articles = shopifyBlogs.flatMap(blog =>
          (blog.articles || []).map(article => ({
            ...article,
            blogHandle: blog.handle || "news",
            excerpt: getCleanExcerpt(article),
          }))
        );
      }
    } catch (err) {
      console.error("Shopify CMS blogs fallback failed:", err);
    }
  }

  if (!articles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">No blogs found.</h1>
      </div>
    );
  }

  return (<>
  <Breadcrumbs />
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-amber-100 py-12 px-6 sm:px-12">
      <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-10 text-center">
        Khakhra Parampara
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            {/* Article Image */}
            <img
              src={post.image?.url || "/blog-placeholder.webp"}
              alt={post.title}
              className="w-full h-75 object-cover hover:scale-105 transition-transform duration-500"
            />

            <div className="p-6">

              {/* Date */}
              {post.publishedAt && (
                <p className="text-sm text-amber-600 mb-3">
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <h2 className="text-xl font-bold text-amber-900 mb-3">{post.title}</h2>
              {post.excerpt && (
                <p className="text-amber-700 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              <Link
                href={`/blog/${post.blogHandle}/${post.handle}`}
                className="text-amber-900 font-medium hover:text-amber-600"
              >
                Read More →
              </Link>
            </div>
          </article>

        ))}
      </div>
    </main></>
  );
}
