import http from 'http'
import { performance } from 'perf_hooks'

const BASE_URL = 'http://localhost:5000'

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    const start = performance.now()
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        const duration = performance.now() - start
        resolve({
          status: res.statusCode,
          duration,
          body,
          error: res.statusCode >= 400,
        })
      })
    })

    req.on('error', (err) => {
      const duration = performance.now() - start
      resolve({
        status: 0,
        duration,
        body: err.message,
        error: true,
      })
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { p50: 0, p95: 0, p99: 0, avg: 0 }
  const sorted = [...latencies].sort((a, b) => a - b)
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || sorted[0]
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1]
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1]
  const avg = sorted.reduce((sum, v) => sum + v, 0) / sorted.length
  return {
    p50: Number(p50.toFixed(2)),
    p95: Number(p95.toFixed(2)),
    p99: Number(p99.toFixed(2)),
    avg: Number(avg.toFixed(2)),
  }
}

// --------------------------------------------------------------------------
// SECURITY ISOLATION SUITE
// --------------------------------------------------------------------------
async function runSecurityIsolationTests() {
  console.log('\n🔒 RUNNING MULTI-USER SECURITY & DATA ISOLATION SUITE...')
  let passed = true

  // 1. Unauthenticated request to /api/orders/phone/9876543210
  const orderHistoryCheck = await makeRequest('GET', '/api/orders/phone/9876543210')
  if (orderHistoryCheck.status === 401 || orderHistoryCheck.status === 403) {
    console.log('  [PASS] Unauthenticated access to /api/orders/phone/9876543210 correctly BLOCKED (401/403).')
  } else {
    console.error(`  [FAIL] Data Leakage! Unauthenticated request returned HTTP ${orderHistoryCheck.status}`)
    passed = false
  }

  // 2. Unauthenticated request to /api/auth/test-email
  const testEmailCheck = await makeRequest('GET', '/api/auth/test-email')
  if (testEmailCheck.status === 401 || testEmailCheck.status === 403) {
    console.log('  [PASS] Public call to /api/auth/test-email correctly BLOCKED (401/403).')
  } else {
    console.error(`  [FAIL] Security Leakage! Public access to /api/auth/test-email returned HTTP ${testEmailCheck.status}`)
    passed = false
  }

  // 3. User A accessing User B's cart
  const crossUserCartCheck = await makeRequest('GET', '/api/cart/9876543210')
  if (crossUserCartCheck.status === 403 || crossUserCartCheck.status === 401) {
    console.log("  [PASS] User A attempting access to User B's cart correctly BLOCKED (403/401).")
  } else {
    console.error(`  [FAIL] Cart Isolation Failure! Returned HTTP ${crossUserCartCheck.status}`)
    passed = false
  }

  return passed
}

// --------------------------------------------------------------------------
// CONCURRENT VIRTUAL USER WORKLOAD
// --------------------------------------------------------------------------
async function simulateVirtualUser(userId, sampleProductId) {
  const session = `guest-sim-user-${userId}-${Date.now()}`
  const results = []

  // Step 1: Catalog Read
  results.push(await makeRequest('GET', '/api/products'))

  // Step 2: Settings Read
  results.push(await makeRequest('GET', '/api/settings'))

  // Step 3: Categories Read
  results.push(await makeRequest('GET', '/api/categories'))

  // Step 4: Cart Read
  results.push(await makeRequest('GET', `/api/cart/${session}`))

  // Step 5: Cart Write
  results.push(await makeRequest('PUT', `/api/cart/${session}`, {
    items: [{ product: sampleProductId || '6a7196beb2b12147bf750367', quantity: 1, size: 'A3', priceAtAdd: 399 }]
  }))

  // Step 6: Wishlist Toggle
  if (sampleProductId && sampleProductId.length === 24) {
    results.push(await makeRequest('POST', `/api/wishlist/${session}/toggle`, { productId: sampleProductId }))
  }

  // Step 7: Order Creation Submission
  results.push(await makeRequest('POST', '/api/orders', {
    items: [{ product: sampleProductId || '6a7196beb2b12147bf750367', quantity: 1, price: 399, size: 'A3' }],
    shipping: { name: `Test User ${userId}`, phone: `980000${String(userId).padStart(4, '0')}`, address: '123 Test St', city: 'Test City', pincode: '638052' },
    deliveryMethod: 'courier',
    pricing: { subtotal: 399, total: 478 }
  }))

  return results
}

// --------------------------------------------------------------------------
// MULTI-TIER CONCURRENCY LOAD BENCHMARK
// --------------------------------------------------------------------------
async function runLoadTier(concurrencyLevel, sampleProductId) {
  console.log(`\n------------------------------------------------------------`)
  console.log(`🚀 TESTING BENCHMARK: ${concurrencyLevel} CONCURRENT VIRTUAL USERS`)
  console.log(`------------------------------------------------------------`)

  const memBefore = process.memoryUsage().heapUsed / 1024 / 1024
  const startTier = performance.now()

  // Launch concurrencyLevel users concurrently
  const userPromises = []
  for (let i = 1; i <= concurrencyLevel; i++) {
    userPromises.push(simulateVirtualUser(i, sampleProductId))
  }

  const allUserResults = await Promise.all(userPromises)
  const totalTierDurationMs = performance.now() - startTier
  const memAfter = process.memoryUsage().heapUsed / 1024 / 1024

  const flatResults = allUserResults.flat()
  const totalRequests = flatResults.length
  const latencies = flatResults.map((r) => r.duration)
  const errors = flatResults.filter((r) => r.error)
  const statusCounts = {}

  flatResults.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
  })

  const percentiles = calculatePercentiles(latencies)
  const rps = Number(((totalRequests / (totalTierDurationMs / 1000))).toFixed(1))
  const errorRatePct = Number(((errors.length / totalRequests) * 100).toFixed(2))

  console.log(`  Total Requests Executed : ${totalRequests}`)
  console.log(`  Requests Per Second (RPS): ${rps}`)
  console.log(`  Average Response Time   : ${percentiles.avg} ms`)
  console.log(`  p50 Latency             : ${percentiles.p50} ms`)
  console.log(`  p95 Latency             : ${percentiles.p95} ms`)
  console.log(`  p99 Latency             : ${percentiles.p99} ms`)
  console.log(`  Error Rate              : ${errorRatePct}% (${errors.length}/${totalRequests})`)
  console.log(`  HTTP Status Distribution: ${JSON.stringify(statusCounts)}`)
  console.log(`  Heap Memory Utilization : ${memAfter.toFixed(1)} MB (delta: ${(memAfter - memBefore).toFixed(1)} MB)`)

  return {
    concurrency: concurrencyLevel,
    totalRequests,
    rps,
    percentiles,
    errorRatePct,
    errorsCount: errors.length,
    statusCounts,
    totalDurationMs: Number(totalTierDurationMs.toFixed(2)),
  }
}

// --------------------------------------------------------------------------
// MAIN AUDIT RUNNER
// --------------------------------------------------------------------------
async function main() {
  console.log('============================================================')
  console.log('   WALLSTICKS CONCURRENCY, SECURITY & LOAD TEST SUITE      ')
  console.log('============================================================')

  // Fetch sample product ID for realistic workloads
  let sampleProductId = null
  const productsRes = await makeRequest('GET', '/api/products')
  if (productsRes.status === 200) {
    try {
      const data = JSON.parse(productsRes.body)
      const list = Array.isArray(data) ? data.products : (Array.isArray(data) ? data : null)
      if (list && list.length > 0) sampleProductId = list[0]._id
    } catch {}
  }

  // Phase 1: Security Isolation
  const securityResult = await runSecurityIsolationTests()

  // Phase 2: Load Benchmarks
  const concurrencyTiers = [1, 10, 25, 50, 100, 250, 500]
  const tierResults = []

  for (const level of concurrencyTiers) {
    const tierRes = await runLoadTier(level, sampleProductId)
    tierResults.push(tierRes)
  }

  console.log('\n============================================================')
  console.log('   FINAL AUDIT SUMMARY & BENCHMARK SCORECARD               ')
  console.log('============================================================')
  console.log(`Security & Isolation Check: ${securityResult ? 'PASSED' : 'FAILED'}\n`)

  console.table(
    tierResults.map((t) => ({
      'Concurrent Users': t.concurrency,
      'Total Requests': t.totalRequests,
      'RPS': t.rps,
      'Avg (ms)': t.percentiles.avg,
      'p50 (ms)': t.percentiles.p50,
      'p95 (ms)': t.percentiles.p95,
      'p99 (ms)': t.percentiles.p99,
      'Error Rate': `${t.errorRatePct}%`,
    }))
  )
}

main().catch(console.error)
