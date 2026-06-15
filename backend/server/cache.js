/**
 * Redis Cache Service
 * Handles caching, sessions, real-time metrics, and message queues
 */

const redis = require('redis');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  legacyMode: false,
});

client.on('connect', () => {
  console.log('✅ Redis Connected');
});

client.on('ready', () => {
  console.log('✅ Redis Ready');
});

client.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

client.on('reconnecting', () => {
  console.log('⚠️  Redis Reconnecting...');
});

(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
})();

async function get(key) {
  const data = await client.get(key);
  if (data === null) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

async function set(key, value, ttl = 3600) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttl) {
    await client.setEx(key, ttl, serialized);
  } else {
    await client.set(key, serialized);
  }
  return true;
}

async function del(key) {
  const count = await client.del(key);
  return count > 0;
}

async function incr(key, amount = 1, ttl = null) {
  const result = await client.incrBy(key, amount);
  if (ttl) {
    await client.expire(key, ttl);
  }
  return result;
}

async function keys(pattern) {
  return await client.keys(pattern);
}

const sessionCache = {
  async set(userId, token, data, ttl = 86400) {
    const key = `session:${userId}:${token.substring(0, 20)}`;
    return set(key, data, ttl);
  },

  async get(userId, token) {
    const key = `session:${userId}:${token.substring(0, 20)}`;
    return get(key);
  },

  async delete(userId, token) {
    const key = `session:${userId}:${token.substring(0, 20)}`;
    return del(key);
  }
};

const applicationCache = {
  async set(applicationId, data, ttl = 3600) {
    const key = `application:${applicationId}`;
    return set(key, data, ttl);
  },

  async get(applicationId) {
    const key = `application:${applicationId}`;
    return get(key);
  },

  async delete(applicationId) {
    const key = `application:${applicationId}`;
    return del(key);
  },

  async invalidateAll() {
    const keysList = await keys('application:*');
    if (!keysList || keysList.length === 0) return 0;
    await client.del(keysList);
    return keysList.length;
  }
};

const configCache = {
  async set(key, value, ttl = 3600) {
    const cacheKey = `config:${key}`;
    return set(cacheKey, value, ttl);
  },

  async get(key) {
    const cacheKey = `config:${key}`;
    return get(cacheKey);
  },

  async invalidate(key) {
    const cacheKey = `config:${key}`;
    return del(cacheKey);
  },

  async invalidateAll() {
    const keysList = await keys('config:*');
    if (!keysList || keysList.length === 0) return 0;
    await client.del(keysList);
    return keysList.length;
  }
};

const metrics = {
  async incrementPredictions(count = 1) {
    const date = new Date().toISOString().split('T')[0];
    return incr(`metrics:predictions:${date}`, count, 86400);
  },

  async incrementApprovals(count = 1) {
    const date = new Date().toISOString().split('T')[0];
    return incr(`metrics:approvals:${date}`, count, 86400);
  },

  async incrementRejections(count = 1) {
    const date = new Date().toISOString().split('T')[0];
    return incr(`metrics:rejections:${date}`, count, 86400);
  },

  async incrementManualReviews(count = 1) {
    const date = new Date().toISOString().split('T')[0];
    return incr(`metrics:manual_reviews:${date}`, count, 86400);
  },

  async getMetrics(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const keysList = [
      `metrics:predictions:${targetDate}`,
      `metrics:approvals:${targetDate}`,
      `metrics:rejections:${targetDate}`,
      `metrics:manual_reviews:${targetDate}`
    ];
    const values = await client.mGet(keysList);
    return {
      predictions: parseInt(values[0] || 0, 10),
      approvals: parseInt(values[1] || 0, 10),
      rejections: parseInt(values[2] || 0, 10),
      manual_reviews: parseInt(values[3] || 0, 10),
      date: targetDate
    };
  }
};

module.exports = {
  get,
  set,
  del,
  incr,
  keys,
  sessionCache,
  applicationCache,
  configCache,
  metrics
};

/**
 * Rate Limiting: Prevent API abuse
 */
const rateLimit = {
  async checkLimit(userId, limit = 100, windowSeconds = 3600) {
    const key = `rate:${userId}`;
    const current = await incr(key, 1, windowSeconds);
    return current <= limit;
  },
  
  async getCount(userId) {
    const key = `rate:${userId}`;
    return get(key);
  },
  
  async reset(userId) {
    const key = `rate:${userId}`;
    return del(key);
  }
};

/**
 * Leaderboard: Top analysts, approval rates, etc.
 */
const leaderboard = {
  async recordAnalystScore(userId, score) {
    return new Promise((resolve, reject) => {
      client.zadd('leaderboard:analysts:scores', score, userId, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },
  
  async getTopAnalysts(limit = 10) {
    return new Promise((resolve, reject) => {
      client.zrevrange('leaderboard:analysts:scores', 0, limit - 1, 'WITHSCORES', (err, results) => {
        if (err) reject(err);
        else {
          const analysts = [];
          for (let i = 0; i < results.length; i += 2) {
            analysts.push({
              userId: results[i],
              score: parseFloat(results[i + 1])
            });
          }
          resolve(analysts);
        }
      });
    });
  }
};

/**
 * Queue: For background jobs (batch processing, email notifications)
 */
const queue = {
  async enqueue(jobName, data, priority = 0) {
    const job = {
      id: `${jobName}:${Date.now()}`,
      name: jobName,
      data,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    return new Promise((resolve, reject) => {
      client.zadd(`queue:${jobName}`, priority, JSON.stringify(job), (err) => {
        if (err) reject(err);
        else resolve(job.id);
      });
    });
  },
  
  async dequeue(jobName) {
    return new Promise((resolve, reject) => {
      client.zrange(`queue:${jobName}`, 0, 0, (err, results) => {
        if (err) reject(err);
        if (results.length === 0) {
          resolve(null);
        } else {
          const job = JSON.parse(results[0]);
          client.zrem(`queue:${jobName}`, results[0], (err) => {
            if (err) reject(err);
            else resolve(job);
          });
        }
      });
    });
  },
  
  async getQueueSize(jobName) {
    return new Promise((resolve, reject) => {
      client.zcard(`queue:${jobName}`, (err, count) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  }
};

/**
 * Health check
 */
async function ping() {
  return new Promise((resolve, reject) => {
    client.ping((err, result) => {
      if (err) reject(err);
      else resolve(result === 'PONG');
    });
  });
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  return new Promise((resolve, reject) => {
    client.quit((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Redis cache closed');
        resolve();
      }
    });
  });
}

module.exports = {
  client,
  get,
  set,
  del,
  incr,
  ping,
  shutdown,
  
  // Cache namespaces
  sessionCache,
  applicationCache,
  configCache,
  
  // Real-time metrics
  metrics,
  
  // Rate limiting
  rateLimit,
  
  // Leaderboards
  leaderboard,
  
  // Queue system
  queue
};
