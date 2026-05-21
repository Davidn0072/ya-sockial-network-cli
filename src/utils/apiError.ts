export async function getServerErrorMessage(
  response: Response,
  fallback = 'Something went wrong'
): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const json = JSON.parse(text) as { message?: string };
      if (typeof json.message === 'string' && json.message.trim()) {
        return json.message;
      }
    } catch {
      return text;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

interface HttpErrorContext {
  method?: string;
  url?: string;
  requestBody?: unknown;
}

export async function formatHttpError(
  response: Response,
  context?: HttpErrorContext
): Promise<string> {
  const lines: string[] = [
    `HTTP ${response.status} ${response.statusText}`,
    response.status >= 500
      ? 'Source: server error'
      : response.status >= 400
        ? 'Source: server rejected the request (4xx)'
        : 'Source: unexpected response',
  ];

  if (context?.method && context?.url) {
    lines.push(`Request: ${context.method} ${context.url}`);
  }
  if (context?.requestBody !== undefined) {
    lines.push(`Request body:\n${JSON.stringify(context.requestBody, null, 2)}`);
  }

  try {
    const text = await response.text();
    if (!text) {
      lines.push('Server response: (empty body)');
    } else {
      try {
        const json = JSON.parse(text);
        lines.push('Server response (JSON):');
        lines.push(JSON.stringify(json, null, 2));
      } catch {
        lines.push('Server response (text):');
        lines.push(text);
      }
    }
  } catch {
    lines.push('Server response: (could not read body)');
  }

  return lines.join('\n\n');
}

export function formatClientError(error: unknown, context?: string): string {
  const lines = ['Source: client / network (request did not complete successfully)'];
  if (context) {
    lines.push(context);
  }
  if (error instanceof Error) {
    lines.push(`${error.name}: ${error.message}`);
  } else {
    lines.push(String(error));
  }
  return lines.join('\n\n');
}
