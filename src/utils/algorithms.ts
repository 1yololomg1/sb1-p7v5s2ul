/**
 * @license
 * Well Log Cleaner - Advanced Well Log Processing Algorithms
 * Copyright (C) 2025 Well Log Cleaner
 * 
 * This program is protected by copyright law and international treaties.
 * Unauthorized reproduction or distribution of this program, or any portion
 * of it, may result in severe civil and criminal penalties, and will be
 * prosecuted to the maximum extent possible under law.
 * 
 * This file contains proprietary algorithms for well log data processing.
 * Any use of these algorithms must be licensed and authorized.
 */

import FFT from 'fft.js';

/**
 * Apply a median filter to smooth data while preserving edges
 */
export const medianFilter = (data: number[], windowSize: number = 5): number[] => {
  if (windowSize < 3 || windowSize % 2 === 0) {
    windowSize = windowSize < 3 ? 3 : windowSize + 1; // Ensure odd and at least 3
  }
  
  const halfWindow = Math.floor(windowSize / 2);
  const result = [...data];
  
  for (let i = 0; i < data.length; i++) {
    const window = [];
    
    // Collect values within the window
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const index = i + j;
      if (index >= 0 && index < data.length) {
        window.push(data[index]);
      }
    }
    
    // Sort window values and get median
    window.sort((a, b) => a - b);
    const medianIndex = Math.floor(window.length / 2);
    result[i] = window[medianIndex];
  }
  
  return result;
};

/**
 * Apply moving average filter (simple low-pass filter)
 */
export const movingAverage = (
  data: number[], 
  windowSize: number = 5, 
  preserveEdges: boolean = true
): number[] => {
  if (windowSize < 3) windowSize = 3;
  
  const halfWindow = Math.floor(windowSize / 2);
  const result = [...data];
  
  for (let i = 0; i < data.length; i++) {
    // Skip edges if preserveEdges is true
    if (preserveEdges && (i < halfWindow || i >= data.length - halfWindow)) {
      continue;
    }
    
    let sum = 0;
    let count = 0;
    
    // Sum values within the window
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const index = i + j;
      if (index >= 0 && index < data.length) {
        sum += data[index];
        count++;
      }
    }
    
    result[i] = sum / count;
  }
  
  return result;
};

/**
 * Create a low-pass filter mask with smooth transition
 */
const createLowPassFilterMask = (n: number, cutoffRatio: number): number[] => {
  const mask = new Array(n).fill(0);
  const cutoffIndex = Math.floor(n * cutoffRatio);
  
  // Create smooth transition instead of hard cutoff
  for (let i = 0; i < n; i++) {
    if (i < cutoffIndex * 0.9) {
      mask[i] = 1;
    } else if (i < cutoffIndex) {
      // Smooth transition zone
      const x = (i - cutoffIndex * 0.9) / (cutoffIndex * 0.1);
      mask[i] = 0.5 * (1 + Math.cos(Math.PI * x));
    }
  }
  
  return mask;
};

/**
 * Apply low-pass filter using FFT with edge handling
 */
export const lowPassFilter = (data: number[], cutoffFrequency: number = 0.1): number[] => {
  // Add padding to reduce edge effects
  const padLength = Math.floor(data.length * 0.1);
  const paddedData = [
    ...data.slice(0, padLength).reverse(),
    ...data,
    ...data.slice(-padLength).reverse()
  ];
  
  // Find next power of 2 for FFT
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(paddedData.length)));
  
  // Create padded array
  const extendedData = [...paddedData];
  while (extendedData.length < nextPow2) {
    extendedData.push(extendedData[extendedData.length - 1]);
  }
  
  // Initialize FFT
  const fft = new FFT(nextPow2);
  
  // Prepare input/output arrays
  const input = new Float64Array(nextPow2 * 2);
  const output = new Float64Array(nextPow2 * 2);
  
  // Fill real part with data, imaginary part with zeros
  for (let i = 0; i < nextPow2; i++) {
    input[i * 2] = extendedData[i];
    input[i * 2 + 1] = 0;
  }
  
  // Forward FFT
  fft.transform(output, input);
  
  // Apply low-pass filter mask
  const mask = createLowPassFilterMask(nextPow2, cutoffFrequency);
  for (let i = 0; i < nextPow2; i++) {
    output[i * 2] *= mask[i];     // Real part
    output[i * 2 + 1] *= mask[i]; // Imaginary part
  }
  
  // Inverse FFT using conjugate method
  for (let i = 0; i < nextPow2 * 2; i += 2) {
    output[i + 1] = -output[i + 1]; // Conjugate
  }
  
  fft.transform(input, output);
  
  for (let i = 0; i < nextPow2 * 2; i += 2) {
    input[i] = input[i] / nextPow2;
    input[i + 1] = -input[i + 1] / nextPow2;
  }
  
  // Extract real part and remove padding
  const result = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = input[(i + padLength) * 2];
  }
  
  return result;
};

/**
 * Remove spikes while preserving trends
 */
export const despike = (
  data: number[], 
  threshold: number = 3.0, 
  windowSize: number = 11
): number[] => {
  const result = [...data];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = halfWindow; i < data.length - halfWindow; i++) {
    const window = data.slice(i - halfWindow, i + halfWindow + 1);
    const median = calculateMedian(window);
    const deviation = calculateMAD(window, median);
    
    // Check if the point is a spike
    if (Math.abs(data[i] - median) > threshold * deviation) {
      result[i] = median;
    }
  }
  
  return result;
};

/**
 * Calculate median of an array
 */
const calculateMedian = (arr: number[]): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/**
 * Calculate Median Absolute Deviation
 */
const calculateMAD = (arr: number[], median: number): number => {
  const deviations = arr.map(val => Math.abs(val - median));
  return calculateMedian(deviations);
};

/**
 * Wavelet denoising using basic thresholding
 */
export const waveletDenoising = (
  data: number[], 
  threshold: number = 0.1, 
  level: number = 3
): number[] => {
  let result = [...data];
  
  // Apply moving average with decreasing window sizes
  let windowSize = Math.pow(2, level);
  for (let i = 0; i < level; i++) {
    result = movingAverage(result, windowSize, true);
    windowSize = Math.max(3, Math.floor(windowSize / 2));
  }
  
  // Apply soft thresholding
  const originalScale = data.map((val, i) => val - result[i]);
  const maxDeviation = Math.max(...originalScale.map(Math.abs));
  const scaledThreshold = threshold * maxDeviation;
  
  // Apply soft thresholding and add back to smoothed signal
  for (let i = 0; i < result.length; i++) {
    const detail = originalScale[i];
    const sign = Math.sign(detail);
    const magnitude = Math.abs(detail);
    
    // Keep only significant details
    if (magnitude > scaledThreshold) {
      result[i] += sign * (magnitude - scaledThreshold);
    }
  }
  
  return result;
};

/**
 * Adaptive filter that adjusts based on local signal properties
 */
export const adaptiveFilter = (
  data: number[], 
  sensitivity: number = 0.5, 
  windowSize: number = 11
): number[] => {
  const result = [...data];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = halfWindow; i < data.length - halfWindow; i++) {
    const window = data.slice(i - halfWindow, i + halfWindow + 1);
    const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
    
    // Calculate adaptive weight based on local variance
    const stdDev = Math.sqrt(variance);
    const weight = 1 - Math.min(1, Math.max(0, sensitivity * stdDev));
    
    // Apply weighted average
    result[i] = data[i] * (1 - weight) + mean * weight;
  }
  
  return result;
};

/**
 * Process a curve with selected algorithms and parameters
 */
export const processCurve = (
  data: number[], 
  algorithms: { 
    name: string;
    enabled: boolean;
    parameters: { [key: string]: number | boolean | string };
  }[]
): number[] => {
  let processedData = [...data];
  
  // Apply each enabled algorithm in sequence
  for (const algorithm of algorithms) {
    if (!algorithm.enabled) continue;
    
    switch (algorithm.name) {
      case 'medianFilter':
        processedData = medianFilter(
          processedData, 
          algorithm.parameters.windowSize as number
        );
        break;
        
      case 'movingAverage':
        processedData = movingAverage(
          processedData, 
          algorithm.parameters.windowSize as number,
          algorithm.parameters.preserveEdges as boolean
        );
        break;
        
      case 'lowPassFilter':
        processedData = lowPassFilter(
          processedData, 
          algorithm.parameters.cutoffFrequency as number
        );
        break;
        
      case 'despike':
        processedData = despike(
          processedData, 
          algorithm.parameters.threshold as number,
          algorithm.parameters.windowSize as number
        );
        break;
        
      case 'waveletDenoising':
        processedData = waveletDenoising(
          processedData, 
          algorithm.parameters.threshold as number,
          algorithm.parameters.level as number
        );
        break;
        
      case 'adaptiveFilter':
        processedData = adaptiveFilter(
          processedData, 
          algorithm.parameters.sensitivity as number,
          algorithm.parameters.windowSize as number
        );
        break;
    }
  }
  
  return processedData;
};