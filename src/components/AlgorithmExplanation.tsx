import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

const AlgorithmExplanation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-neutral-100 border-b border-neutral-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-primary-600" />
          <h3 className="text-neutral-700 font-medium">Algorithm Details</h3>
        </div>
        
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-neutral-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Median Filter</h4>
            <p className="text-neutral-600 mb-2">
              The median filter operates by selecting the median value within a sliding window, effectively removing outliers while preserving edges.
            </p>
            <div className="bg-neutral-50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Mathematical Description:</h5>
              <p className="font-mono text-sm">
                y[n] = median(x[n-k], ..., x[n], ..., x[n+k])
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Where:
              </p>
              <ul className="list-disc pl-5 text-sm text-neutral-600">
                <li>y[n] is the output at position n</li>
                <li>x[n] is the input at position n</li>
                <li>k is half the window size (windowSize = 2k + 1)</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Moving Average</h4>
            <p className="text-neutral-600 mb-2">
              A simple low-pass filter that smooths data by averaging values within a sliding window.
            </p>
            <div className="bg-neutral-50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Mathematical Description:</h5>
              <p className="font-mono text-sm">
                y[n] = (1/M) * Σ(x[n-k]), k = 0 to M-1
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Where:
              </p>
              <ul className="list-disc pl-5 text-sm text-neutral-600">
                <li>M is the window size</li>
                <li>Σ represents summation</li>
                <li>Edge preservation uses conditional averaging</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Low Pass Filter (FFT-based)</h4>
            <p className="text-neutral-600 mb-2">
              Removes high-frequency components using Fourier Transform and frequency domain filtering.
            </p>
            <div className="bg-neutral-50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Mathematical Description:</h5>
              <p className="font-mono text-sm">
                Y(f) = X(f) * H(f)
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Where:
              </p>
              <ul className="list-disc pl-5 text-sm text-neutral-600">
                <li>X(f) is the Fourier transform of input</li>
                <li>H(f) is the frequency response (cutoff mask)</li>
                <li>Y(f) is the filtered spectrum</li>
                <li>Final output: y[n] = IFFT(Y(f))</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Despike</h4>
            <p className="text-neutral-600 mb-2">
              Identifies and removes anomalous points using median absolute deviation.
            </p>
            <div className="bg-neutral-50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Mathematical Description:</h5>
              <p className="font-mono text-sm">
                spike = |x[n] - median| {'>'} threshold * MAD
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Where:
              </p>
              <ul className="list-disc pl-5 text-sm text-neutral-600">
                <li>MAD = median(|x[i] - median(x)|)</li>
                <li>threshold is the sensitivity parameter</li>
                <li>Spikes are replaced with local median</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Wavelet Denoising</h4>
            <p className="text-neutral-600 mb-2">
              Multi-scale noise removal using wavelet decomposition and thresholding.
            </p>
            <div className="bg-neutral-50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Mathematical Description:</h5>
              <p className="font-mono text-sm">
                d[j,k] = threshold(⟨x, ψ[j,k]⟩)
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Where:
              </p>
              <ul className="list-disc pl-5 text-sm text-neutral-600">
                <li>ψ[j,k] are wavelet basis functions</li>
                <li>d[j,k] are wavelet coefficients</li>
                <li>Soft thresholding: sign(d) * max(|d| - λ, 0)</li>
                <li>λ is the threshold parameter</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Adaptive Filter</h4>
            <p className="text-neutral-600 mb-2">
              Adjusts filtering strength based on local signal properties.
            </p>
            <div className="bg-neutral-50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Mathematical Description:</h5>
              <p className="font-mono text-sm">
                y[n] = (1 - w[n]) * x[n] + w[n] * μ[n]
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Where:
              </p>
              <ul className="list-disc pl-5 text-sm text-neutral-600">
                <li>w[n] = 1 - min(1, max(0, s * σ[n]))</li>
                <li>μ[n] is local mean</li>
                <li>σ[n] is local standard deviation</li>
                <li>s is sensitivity parameter</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmExplanation;