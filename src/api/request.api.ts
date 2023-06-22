export type HTTP_METHOD = "GET" | "PUT" | "POST" | "HEAD" | "DELETE";

export function makeRequest(
  url: string,
  method: HTTP_METHOD,
  body?: any,
  authorizationToken?: string
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${authorizationToken}`,
    },
    body: JSON.stringify(body),
    mode: "cors",
  });
}

export async function get(path: string, url?: string): Promise<any> {
  const endpoint = `${
    url ?? (process.env.NEXT_PUBLIC_API_ENDPOINT as string)
  }${path}`;

  const response = await makeRequest(endpoint, "GET");

  return response.json();
}

export async function post(
  path: string,
  body?: any,
  url?: string
): Promise<any> {
  const endpoint = `${
    url ?? (process.env.NEXT_PUBLIC_API_ENDPOINT as string)
  }${path}`;
  const response = await makeRequest(endpoint, "POST", body);

  return response.json();
}

export async function deleteRequest(path: string): Promise<any> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT as string}${path}`;

  const response = await makeRequest(endpoint, "DELETE");
  return response.json();
}
