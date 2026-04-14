/**
 * AI Request Queue & Concurrency Limiter
 * 
 * Prevents Groq API rate-limit errors when 50+ users are hitting AI endpoints
 * simultaneously. Uses a bounded concurrency pool with retry + exponential backoff.
 */

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  retries: number;
}

class AIRequestQueue {
  private queue: QueuedTask<any>[] = [];
  private activeCount = 0;
  private readonly maxConcurrent: number;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;

  constructor(maxConcurrent = 5, maxRetries = 3, baseDelayMs = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
  }

  /**
   * Enqueue an async function to be executed with concurrency control.
   * Returns a promise that resolves when the task completes.
   */
  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, retries: 0 });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;

    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.statusCode === 429 ||
        error?.message?.includes('rate_limit') || error?.message?.includes('429') ||
        error?.error?.type === 'rate_limit_error';

      if (isRateLimit && task.retries < this.maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = this.baseDelayMs * Math.pow(2, task.retries);
        task.retries++;
        console.warn(`[AIQueue] Rate limited, retry ${task.retries}/${this.maxRetries} after ${delay}ms`);
        
        setTimeout(() => {
          this.queue.unshift(task); // Put back at front of queue
          this.processNext();
        }, delay);
      } else {
        task.reject(error);
      }
    } finally {
      this.activeCount--;
      // Process next item in queue
      this.processNext();
    }
  }

  /** Current queue depth for monitoring */
  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.activeCount;
  }
}

// Singleton instance — max 5 concurrent Groq API calls, 3 retries, 1s base delay
export const aiQueue = new AIRequestQueue(5, 3, 1000);
