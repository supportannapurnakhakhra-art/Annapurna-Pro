import { NextResponse } from "next/server";
import { adminRequest } from "@/lib/shopify";

export async function POST(request) {
  try {
    const { action, customerId, wishlist } = await request.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    const shopifyCustomerId = customerId.startsWith("gid://")
      ? customerId
      : `gid://shopify/Customer/${customerId}`;

    if (action === "get") {
      const query = `
        query getCustomerWishlist($id: ID!) {
          customer(id: $id) {
            metafield(namespace: "custom", key: "wishlist") {
              value
            }
          }
        }
      `;

      const data = await adminRequest(query, { id: shopifyCustomerId });
      const wishlistIds = data.customer?.metafield?.value ? JSON.parse(data.customer.metafield.value) : [];

      if (wishlistIds.length === 0) {
        return NextResponse.json({ success: true, wishlist: [] });
      }

      // Fetch products details for these IDs
      const productQuery = `
              query getProducts($ids: [ID!]!) {
                nodes(ids: $ids) {
                  ... on Product {
                    id
                    title
                    handle
                    vendor
                    availableForSale
                    featuredImage {
                      url
                      altText
                    }
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    compareAtPriceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          id
                          title
                          price {
                            amount
                            currencyCode
                          }
                          compareAtPrice {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            `;

      const productData = await adminRequest(productQuery, { ids: wishlistIds });
      const expandedWishlist = (productData.nodes || [])
        .filter(node => node && node.id)
        .map(node => ({
          id: node.id,
          title: node.title,
          handle: node.handle,
          vendor: node.vendor,
          availableForSale: node.availableForSale,
          featuredImage: node.featuredImage, // ProductCard uses this
          image: node.featuredImage,         // Backup
          price: node.variants?.edges[0]?.node?.price || node.priceRange?.minVariantPrice,
          compareAtPrice: node.variants?.edges[0]?.node?.compareAtPrice || node.compareAtPriceRange?.minVariantPrice,
          defaultVariant: node.variants?.edges[0]?.node
        }));

      return NextResponse.json({ success: true, wishlist: expandedWishlist });
    }

    if (action === "set") {
      // Store only IDs
      const wishlistIds = Array.isArray(wishlist)
        ? wishlist.map(item => (typeof item === 'string' ? item : item.id))
        : [];

      const mutation = `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          id: shopifyCustomerId,
          metafields: [
            {
              namespace: "custom",
              key: "wishlist",
              type: "json",
              value: JSON.stringify(wishlistIds),
            },
          ],
        },
      };

      await adminRequest(mutation, variables);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Wishlist API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
