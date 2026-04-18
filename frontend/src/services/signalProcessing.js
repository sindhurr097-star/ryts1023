/**
 * Advanced Signal Processing Service
 * Implements multiple noise filtering algorithms to detect and remove anomalies
 */

/**
 * Kalman Filter Implementation
 * Optimal recursive filter that estimates the state of a system
 * Excellent for noise reduction in sensor data
 */
class KalmanFilter {
  constructor(processNoise = 0.1, measurementNoise = 1, estimatedError = 1, initialValue = 0) {
    this.processNoise = processNoise; // Q: process noise covariance
    this.measurementNoise = measurementNoise; // R: measurement noise covariance
    this.estimatedError = estimatedError; // P: estimation error covariance
    this.value = initialValue; // x: estimated value
  }

  filter(measurement) {
    // Prediction
    const prediction = this.value;
    const predictionError = this.estimatedError + this.processNoise;

    // Kalman Gain
    const kalmanGain = predictionError / (predictionError + this.measurementNoise);

    // Update
    this.value = prediction + kalmanGain * (measurement - prediction);
    this.estimatedError = (1 - kalmanGain) * predictionError;

    return this.value;
  }

  reset() {
    this.value = 0;
    this.estimatedError = 1;
  }
}

/**
 * Moving Average Filter
 * Simple but effective for reducing random noise
 */
class MovingAverageFilter {
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.window = [];
  }

  filter(value) {
    this.window.push(value);
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }
    const sum = this.window.reduce((a, b) => a + b, 0);
    return sum / this.window.length;
  }

  reset() {
    this.window = [];
  }
}

/**
 * Exponential Moving Average Filter
 * Gives more weight to recent readings
 */
class ExponentialMovingAverageFilter {
  constructor(alpha = 0.3) {
    this.alpha = alpha; // Smoothing factor (0-1)
    this.ema = null;
  }

  filter(value) {
    if (this.ema === null) {
      this.ema = value;
    } else {
      this.ema = this.alpha * value + (1 - this.alpha) * this.ema;
    }
    return this.ema;
  }

  reset() {
    this.ema = null;
  }
}

/**
 * Median Filter
 * Excellent for removing spike noise while preserving edges
 */
class MedianFilter {
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.window = [];
  }

  filter(value) {
    this.window.push(value);
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }
    const sorted = [...this.window].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  reset() {
    this.window = [];
  }
}

/**
 * Z-Score Anomaly Detector
 * Detects anomalies based on statistical deviation from mean
 */
class ZScoreAnomalyDetector {
  constructor(threshold = 3, windowSize = 20) {
    this.threshold = threshold; // Standard deviations
    this.windowSize = windowSize;
    this.window = [];
  }

  detect(value) {
    this.window.push(value);
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }

    if (this.window.length < 5) {
      return { isAnomaly: false, zScore: 0, mean: value, stdDev: 0 };
    }

    const mean = this.window.reduce((a, b) => a + b, 0) / this.window.length;
    const variance = this.window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.window.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return { isAnomaly: false, zScore: 0, mean, stdDev };
    }

    const zScore = Math.abs((value - mean) / stdDev);
    const isAnomaly = zScore > this.threshold;

    return { isAnomaly, zScore, mean, stdDev };
  }

  reset() {
    this.window = [];
  }
}

/**
 * Interquartile Range (IQR) Anomaly Detector
 * Robust statistical method for outlier detection
 */
class IQROutlierDetector {
  constructor(multiplier = 1.5, windowSize = 20) {
    this.multiplier = multiplier; // IQR multiplier
    this.windowSize = windowSize;
    this.window = [];
  }

  detect(value) {
    this.window.push(value);
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }

    if (this.window.length < 5) {
      return { isAnomaly: false, q1: value, q3: value, iqr: 0 };
    }

    const sorted = [...this.window].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - this.multiplier * iqr;
    const upperBound = q3 + this.multiplier * iqr;

    const isAnomaly = value < lowerBound || value > upperBound;

    return { isAnomaly, q1, q3, iqr, lowerBound, upperBound };
  }

  reset() {
    this.window = [];
  }
}

/**
 * Advanced Signal Processor
 * Combines multiple filtering and detection algorithms
 */
class AdvancedSignalProcessor {
  constructor() {
    this.kalmanFilter = new KalmanFilter(0.1, 1, 1, 0);
    this.movingAverageFilter = new MovingAverageFilter(5);
    this.emaFilter = new ExponentialMovingAverageFilter(0.3);
    this.medianFilter = new MedianFilter(5);
    this.zScoreDetector = new ZScoreAnomalyDetector(3, 20);
    this.iqrDetector = new IQROutlierDetector(1.5, 20);
    
    this.history = {
      raw: [],
      kalman: [],
      movingAverage: [],
      ema: [],
      median: [],
      anomalies: []
    };
  }

  /**
   * Process a single reading through all filters
   */
  process(value) {
    const raw = value;
    const kalman = this.kalmanFilter.filter(value);
    const movingAverage = this.movingAverageFilter.filter(value);
    const ema = this.emaFilter.filter(value);
    const median = this.medianFilter.filter(value);

    const zScoreResult = this.zScoreDetector.detect(value);
    const iqrResult = this.iqrDetector.detect(value);

    // Combined anomaly detection (both methods must agree)
    const isAnomaly = zScoreResult.isAnomaly && iqrResult.isAnomaly;

    // Store history
    this.history.raw.push(raw);
    this.history.kalman.push(kalman);
    this.history.movingAverage.push(movingAverage);
    this.history.ema.push(ema);
    this.history.median.push(median);
    this.history.anomalies.push({
      timestamp: new Date().toISOString(),
      raw,
      isAnomaly,
      zScore: zScoreResult.zScore,
      iqr: iqrResult.iqr
    });

    // Keep only last 100 readings
    const maxHistory = 100;
    if (this.history.raw.length > maxHistory) {
      this.history.raw = this.history.raw.slice(-maxHistory);
      this.history.kalman = this.history.kalman.slice(-maxHistory);
      this.history.movingAverage = this.history.movingAverage.slice(-maxHistory);
      this.history.ema = this.history.ema.slice(-maxHistory);
      this.history.median = this.history.median.slice(-maxHistory);
      this.history.anomalies = this.history.anomalies.slice(-maxHistory);
    }

    // Return filtered value (use Kalman filter as primary)
    return {
      raw,
      filtered: kalman,
      kalman,
      movingAverage,
      ema,
      median,
      isAnomaly,
      zScore: zScoreResult.zScore,
      iqr: iqrResult.iqr
    };
  }

  /**
   * Get the best filtered value based on noise level
   */
  getBestFilteredValue() {
    if (this.history.raw.length < 5) {
      return this.history.raw[this.history.raw.length - 1];
    }

    // Calculate variance for each filter
    const calculateVariance = (data) => {
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
      return variance;
    };

    const kalmanVariance = calculateVariance(this.history.kalman.slice(-10));
    const maVariance = calculateVariance(this.history.movingAverage.slice(-10));
    const emaVariance = calculateVariance(this.history.ema.slice(-10));
    const medianVariance = calculateVariance(this.history.median.slice(-10));

    // Choose filter with lowest variance (most stable)
    const variances = {
      kalman: kalmanVariance,
      movingAverage: maVariance,
      ema: emaVariance,
      median: medianVariance
    };

    const bestFilter = Object.entries(variances).reduce((min, [key, val]) => 
      val < min[1] ? [key, val] : min
    , ['kalman', Infinity])[0];

    return this.history[bestFilter][this.history[bestFilter].length - 1];
  }

  /**
   * Get filtering statistics for proof
   */
  getStatistics() {
    if (this.history.raw.length < 5) {
      return null;
    }

    const calculateStats = (data) => {
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...data);
      const max = Math.max(...data);
      return { mean, variance, stdDev, min, max };
    };

    return {
      raw: calculateStats(this.history.raw),
      kalman: calculateStats(this.history.kalman),
      movingAverage: calculateStats(this.history.movingAverage),
      ema: calculateStats(this.history.ema),
      median: calculateStats(this.history.median),
      anomalyCount: this.history.anomalies.filter(a => a.isAnomaly).length,
      totalReadings: this.history.raw.length
    };
  }

  /**
   * Get before/after comparison
   */
  getBeforeAfterComparison() {
    if (this.history.raw.length < 10) {
      return null;
    }

    const recentRaw = this.history.raw.slice(-10);
    const recentFiltered = this.history.kalman.slice(-10);

    const calculateNoiseLevel = (data) => {
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const noise = data.reduce((a, b) => a + Math.abs(b - mean), 0) / data.length;
      return noise;
    };

    const rawNoise = calculateNoiseLevel(recentRaw);
    const filteredNoise = calculateNoiseLevel(recentFiltered);
    const noiseReduction = ((rawNoise - filteredNoise) / rawNoise * 100).toFixed(2);

    return {
      rawNoise: rawNoise.toFixed(4),
      filteredNoise: filteredNoise.toFixed(4),
      noiseReduction: `${noiseReduction}%`,
      rawValues: recentRaw,
      filteredValues: recentFiltered
    };
  }

  reset() {
    this.kalmanFilter.reset();
    this.movingAverageFilter.reset();
    this.emaFilter.reset();
    this.medianFilter.reset();
    this.zScoreDetector.reset();
    this.iqrDetector.reset();
    this.history = {
      raw: [],
      kalman: [],
      movingAverage: [],
      ema: [],
      median: [],
      anomalies: []
    };
  }
}

// Export classes and create singleton instance
export {
  KalmanFilter,
  MovingAverageFilter,
  ExponentialMovingAverageFilter,
  MedianFilter,
  ZScoreAnomalyDetector,
  IQROutlierDetector,
  AdvancedSignalProcessor
};

// Create and export a singleton instance
const signalProcessor = new AdvancedSignalProcessor();
export default signalProcessor;
