export type Product = { id: string; name: string; category: string; material: string; price: string; moq: string; status: "In Stock" | "Made to Order" | "Request Quote"; description: string };
export type Inquiry = { id: string; name: string; email: string; company: string; country: string; product: string; quantity: string; message: string; createdAt: string };
