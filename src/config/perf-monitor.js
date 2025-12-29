// perf-monitor.mjs
import fs from 'fs';
import v8 from 'v8';
import inspector from 'inspector';
import { performance, monitorEventLoopDelay } from 'perf_hooks';
import path from 'path';

export default class PerfMonitor {
  constructor(options = {}) {
    this.options = {
      logIntervalMs: 5000,
      enableEventLoop: true,
      enableHeap: true,
      enableCpu: true,
      enableSignals: true,
      enableHeapSnapshot: false,
      enableCpuProfile: false,
      cpuProfileDurationMs: 30000,
      outputDir: '/tmp',
      ...options
    };

    this.loopDelay = null;
  }

  /* =====================
   * Public API
   * ===================== */

  start() {
    if (this.options.enableEventLoop) {
      this._startEventLoopMonitor();
    }

    if (this.options.enableSignals) {
      this._registerSignals();
    }

    setInterval(() => {
      this.snapshot('interval');
    }, this.options.logIntervalMs).unref();
  }

  snapshot(label = 'manual') {
    const payload = {
      label,
      time: new Date().toISOString(),
      ...(this.options.enableCpu ? this._cpu() : {}),
      ...(this.options.enableHeap ? this._heap() : {}),
      ...(this.loopDelay ? this._eventLoop() : {})
    };

    console.log('[perf:snapshot]', payload);
  }

  async measure(name, fn) {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const ms = (performance.now() - start).toFixed(1);
      console.log(`[perf:job] ${name} took ${ms}ms`);
    }
  }

  withTimeout(name, fn, ms) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`${name} timeout after ${ms}ms`)),
          ms
        )
      )
    ]);
  }

  /* =====================
   * Internal
   * ===================== */

  _cpu() {
    const { user, system } = process.cpuUsage();
    return {
      cpuUserMs: Math.round(user / 1000),
      cpuSystemMs: Math.round(system / 1000)
    };
  }

  _heap() {
    const m = process.memoryUsage();
    return {
      rssMB: +(m.rss / 1024 / 1024).toFixed(1),
      heapUsedMB: +(m.heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMB: +(m.heapTotal / 1024 / 1024).toFixed(1),
      externalMB: +(m.external / 1024 / 1024).toFixed(1)
    };
  }

  _startEventLoopMonitor() {
    this.loopDelay = monitorEventLoopDelay({ resolution: 20 });
    this.loopDelay.enable();
  }

  _eventLoop() {
    return {
      eventLoopMeanMs: +(this.loopDelay.mean / 1e6).toFixed(1),
      eventLoopMaxMs: +(this.loopDelay.max / 1e6).toFixed(1),
      eventLoopP95Ms: +(this.loopDelay.percentile(95) / 1e6).toFixed(1)
    };
  }

  _registerSignals() {
    process.on('SIGUSR2', async () => {
      console.log('[perf:signal] SIGUSR2 received');
      this.snapshot('sigusr2');

      if (this.options.enableHeapSnapshot) {
        this._dumpHeap();
      }

      if (this.options.enableCpuProfile) {
        await this._cpuProfile();
      }
    });
  }

  _dumpHeap() {
    const file = `${this.options.outputDir}/heap-${Date.now()}.heapsnapshot`;
    const stream = v8.getHeapSnapshot();
    const out = fs.createWriteStream(file);
    stream.pipe(out);
    console.log('[perf] heap snapshot saved', file);
  }

  _cpuProfile() {
    return new Promise((resolve) => {
      const session = new inspector.Session();
      session.connect();

      session.post('Profiler.enable', () => {
        session.post('Profiler.start');

        setTimeout(() => {
          session.post('Profiler.stop', (err, { profile }) => {
            const file = `${this.options.outputDir}/cpu-${Date.now()}.cpuprofile`;
            fs.writeFileSync(file, JSON.stringify(profile));
            console.log('[perf] cpu profile saved', file);
            session.disconnect();
            resolve();
          });
        }, this.options.cpuProfileDurationMs);
      });
    });
  }
}
