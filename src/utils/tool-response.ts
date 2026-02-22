export const ok = (payload: unknown) => ({
  content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
});

export const fail = (message: string) => ({
  content: [{ type: "text", text: JSON.stringify({ error: message }) }],
  isError: true,
});
