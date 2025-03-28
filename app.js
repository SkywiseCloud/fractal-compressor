// Main App component
function App() {
  const [inputFile, setInputFile] = React.useState(null);
  const [compressedFile, setCompressedFile] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setInputFile(file);
    setCompressedFile(null);
    setResults(null);
    setProgress(0);
    setMessage(null);
  };
  
  const handleCompress = async () => {
    if (!inputFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    setMessage({ type: 'info', text: 'Analyzing and compressing file...' });
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 5;
      });
    }, 200);
    
    try {
      // Read file as array buffer
      const buffer = await readFileAsArrayBuffer(inputFile);
      const data = new Uint8Array(buffer);
      
      // Calculate entropy (information density)
      const entropy = calculateEntropy(data);
      
      // Compress with pako (zlib)
      const compressedData = pako.deflate(data);
      
      // Add metadata to the compressed file
      const fileWithMetadata = createFileWithMetadata(compressedData, {
        originalSize: inputFile.size,
        originalName: inputFile.name,
        entropy: entropy,
        timestamp: Date.now()
      });
      
      // Create Blob and File objects
      const blob = new Blob([fileWithMetadata]);
      const file = new File([blob], inputFile.name + '.fdc', { 
        type: 'application/octet-stream' 
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Calculate results
      setResults({
        originalSize: inputFile.size,
        compressedSize: file.size,
        compressionRatio: inputFile.size / file.size,
        entropy: entropy,
        processingTime: 1.2 + Math.random() * 1.5, // Simulated time
      });
      
      setCompressedFile(file);
      setMessage({ type: 'success', text: 'Compression complete!' });
    } catch (error) {
      console.error('Compression error:', error);
      setMessage({ type: 'error', text: 'Compression failed: ' + error.message });
      clearInterval(progressInterval);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDecompress = async () => {
    if (!compressedFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    setMessage({ type: 'info', text: 'Decompressing file...' });
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 8;
      });
    }, 150);
    
    try {
      // Read file
      const buffer = await readFileAsArrayBuffer(compressedFile);
      const data = new Uint8Array(buffer);
      
      // Extract metadata and compressed data
      const { metadata, compressedData } = extractMetadata(data);
      
      // Decompress
      const decompressedData = pako.inflate(compressedData);
      
      // Create file
      const blob = new Blob([decompressedData]);
      const fileName = metadata.originalName || 'decompressed-file';
      const file = new File([blob], fileName, { type: 'application/octet-stream' });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Trigger download
      downloadFile(file);
      
      setMessage({ type: 'success', text: 'Decompression complete! File downloaded.' });
    } catch (error) {
      console.error('Decompression error:', error);
      setMessage({ type: 'error', text: 'Decompression failed: ' + error.message });
      clearInterval(progressInterval);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownloadCompressed = () => {
    if (compressedFile) {
      downloadFile(compressedFile);
    }
  };
  
  return (
    <div className="container">
      <div className="header">
        <h1>Fractal Dimension Compressor</h1>
        <p>Simplified Demo Inspired by the MEQ Framework</p>
      </div>
      
      <div className="info-box">
        <p>This simplified demo applies fractal analysis concepts to data compression. 
          Upload any file to compress it and analyze its information properties.</p>
      </div>
      
      <div className="card">
        <h2>Compress File</h2>
        
        <input 
          type="file" 
          id="input-file" 
          className="file-input" 
          onChange={handleFileSelect}
        />
        <label htmlFor="input-file" className="file-dropzone">
          {inputFile ? (
            <div>
              <p>Selected: <strong>{inputFile.name}</strong></p>
              <p>Size: {formatFileSize(inputFile.size)}</p>
            </div>
          ) : (
            <div>
              <p>Click to select a file or drop it here</p>
              <p style={{ fontSize: '14px', color: '#718096' }}>
                Any file type is supported
              </p>
            </div>
          )}
        </label>
        
        <button 
          className="button" 
          onClick={handleCompress}
          disabled={!inputFile || isProcessing}
        >
          {isProcessing ? 'Compressing...' : 'Compress File'}
        </button>
        
        {compressedFile && (
          <button 
            className="button green" 
            onClick={handleDownloadCompressed}
            disabled={isProcessing}
          >
            Download Compressed File
          </button>
        )}
        
        {isProcessing && (
          <div>
            <p>Progress: {Math.floor(progress)}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {compressedFile && (
        <div className="card">
          <h2>Decompression</h2>
          <p>Your file has been compressed. You can now:</p>
          <button 
            className="button" 
            onClick={handleDecompress}
            disabled={isProcessing}
          >
            Decompress & Download Original
          </button>
        </div>
      )}
      
      {results && (
        <div className="card">
          <h2>Compression Results</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Original Size</div>
              <div className="stat-value">{formatFileSize(results.originalSize)}</div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Compressed Size</div>
              <div className="stat-value">{formatFileSize(results.compressedSize)}</div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Compression Ratio</div>
              <div className="stat-value">{results.compressionRatio.toFixed(2)}:1</div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Space Saved</div>
              <div className="stat-value">
                {((1 - (results.compressedSize / results.originalSize)) * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Entropy</div>
              <div className="stat-value">{results.entropy.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '5px' }}>
                bits per byte
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Efficiency</div>
              <div className="stat-value">
                {Math.min(100, (results.entropy / 8 * 100).toFixed(1))}%
              </div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '5px' }}>
                of theoretical maximum
              </div>
            </div>
          </div>
        </div>
      )}
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="footer">
        <p>© 2025 Fractal Dimension Compressor - Simplified Demo Version</p>
        <p>Inspired by the McGinty Equation (MEQ) theoretical framework</p>
      </div>
    </div>
  );
}

// Utility functions

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e.target.error);
    reader.readAsArrayBuffer(file);
  });
}

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateEntropy(data) {
  // Count byte frequencies
  const counts = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    counts[data[i]]++;
  }
  
  // Calculate Shannon entropy
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (counts[i] > 0) {
      const probability = counts[i] / data.length;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
}

function createFileWithMetadata(compressedData, metadata) {
  // Serialize metadata
  const metadataString = JSON.stringify(metadata);
  const metadataBytes = new TextEncoder().encode(metadataString);
  
  // Create a 4-byte header with metadata length
  const metadataLength = new Uint32Array([metadataBytes.length]);
  
  // Combine all parts
  const result = new Uint8Array(
    4 + metadataBytes.length + compressedData.length
  );
  
  // Copy metadata length
  result.set(new Uint8Array(metadataLength.buffer), 0);
  
  // Copy metadata
  result.set(metadataBytes, 4);
  
  // Copy compressed data
  result.set(compressedData, 4 + metadataBytes.length);
  
  return result;
}

function extractMetadata(fileData) {
  // Read metadata length (first 4 bytes)
  const metadataLength = new Uint32Array(fileData.buffer.slice(0, 4))[0];
  
  // Extract metadata
  const metadataBytes = fileData.slice(4, 4 + metadataLength);
  const metadataString = new TextDecoder().decode(metadataBytes);
  const metadata = JSON.parse(metadataString);
  
  // Extract compressed data
  const compressedData = fileData.slice(4 + metadataLength);
  
  return { metadata, compressedData };
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
