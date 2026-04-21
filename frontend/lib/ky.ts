import ky from "ky";

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api",
  hooks: {
    beforeRequest: [
      (request) => {
        // You can add logic here to inject tokens if not using cookies
        // Better Auth typically uses httpOnly cookies, so fetch/ky will send them automatically
      },
    ],
  },
});
