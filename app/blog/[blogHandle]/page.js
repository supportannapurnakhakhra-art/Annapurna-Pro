import Link from "next/link";
import shopServices from "@/lib/api/services";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata({ params }) {
  const { blogHandle } = await params;
  return {
    title: `${blogHandle ? blogHandle.charAt(0).toUpperCase() + blogHandle.slice(1) : "Blog"} | Annapurna Khakhra`,
    description: "Stories, recipes & health insights from Annapurna Khakhra.",
    alternates: {
      canonical: `/blog/${blogHandle}`,
    },
  };
}

export default async function BlogCategoryPage({ params }) {
  const { blogHandle } = await params;
  const bHandle = blogHandle || "news";
  let articles = [];

  try {
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
          excerpt: post.excerpt || post.summary || post.description || "",
          publishedAt: post.published_at || post.publishedAt || post.created_at || null,
          image: { url: imgUrl },
        });
      });
    }
  } catch (err) {
    console.error("Backend CMS blogs fetch failed for handle:", bHandle, err);
  }

  if (!articles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">No blogs found in this category.</h1>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs />
      <main className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-amber-100 py-12 px-6 sm:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-10 text-center capitalize">
          {bHandle}
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <img
                src={post.image?.url || "/blog-placeholder.webp"}
                alt={post.title}
                className="w-full h-75 object-cover hover:scale-105 transition-transform duration-500"
              />

              <div className="p-6">
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
                  <p
                    className="text-amber-700 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
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
      </main>
    </>
  );
}
