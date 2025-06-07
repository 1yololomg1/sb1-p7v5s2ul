import { LasFile, WellInfo, CurveInfo, LogData } from '../types';
import Papa from 'papaparse';

/**
 * Parses a LAS file content into a structured format using streaming for large files
 */
export const parseLasFile = (filename: string, content: string): LasFile => {
  // Split header and data sections first to process separately
  const [headerContent, dataContent] = splitHeaderAndData(content);
  
  // Parse header sections (small, process synchronously)
  const sections = splitSections(headerContent);
  const version = parseVersionSection(sections.V);
  const wellInfo = parseWellSection(sections.W);
  const curveInfo = parseCurveSection(sections.C);
  
  // Process data section in chunks
  const data = parseDataSectionStreaming(dataContent, curveInfo);
  
  return {
    filename,
    content: '', // Don't store full content to save memory
    version,
    wellInfo,
    curveInfo,
    data,
  };
};

/**
 * Split header and data sections for separate processing
 */
const splitHeaderAndData = (content: string): [string, string] => {
  const lines = content.split(/\r?\n/);
  let dataIndex = -1;
  
  // Find where ~A section starts
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('~A')) {
      dataIndex = i;
      break;
    }
  }
  
  if (dataIndex === -1) {
    throw new Error('No data section found in LAS file');
  }
  
  const headerContent = lines.slice(0, dataIndex).join('\n');
  const dataContent = lines.slice(dataIndex + 1).join('\n');
  
  return [headerContent, dataContent];
};

/**
 * Splits a LAS file content into its different sections
 */
const splitSections = (content: string): { [key: string]: string } => {
  const sections: { [key: string]: string } = {};
  let currentSection = '';
  let sectionContent = '';
  
  const lines = content.split(/\r?\n/);
  
  for (const line of lines) {
    // Ignore empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    
    // Check for section headers
    if (line.startsWith('~')) {
      // If we have content from a previous section, save it
      if (currentSection && sectionContent) {
        sections[currentSection] = sectionContent.trim();
      }
      
      // Get the new section identifier (first character after ~)
      currentSection = line.substring(1, 2).toUpperCase();
      sectionContent = '';
    } else {
      // Add line to current section content
      sectionContent += line + '\n';
    }
  }
  
  // Add the last section
  if (currentSection && sectionContent) {
    sections[currentSection] = sectionContent.trim();
  }
  
  return sections;
};

/**
 * Parses the version section
 */
const parseVersionSection = (versionSection: string): string => {
  if (!versionSection) return '2.0';
  
  const versionMatch = versionSection.match(/VERS\s*\.\s*([0-9.]+)/i);
  return versionMatch ? versionMatch[1] : '2.0';
};

/**
 * Parses the well information section
 */
const parseWellSection = (wellSection: string): WellInfo => {
  const wellInfo: WellInfo = {
    WELL: 'UNKNOWN',
    STRT: 0,
    STOP: 0,
    STEP: 0,
    NULL: -999.25,
    COMP: '',
    FLD: '',
    LOC: '',
    SRVC: '',
    DATE: '',
  };
  
  if (!wellSection) return wellInfo;
  
  const lines = wellSection.split(/\r?\n/);
  
  for (const line of lines) {
    // Skip comments or empty lines
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    
    // Extract mnemonic, unit, value, and description
    const match = line.match(/([^.]+)\.([^:]*):(.*)$/);
    if (match) {
      const mnemonic = match[1].trim();
      const value = match[3].split('|')[0].trim();
      
      // Convert numeric values
      if (['STRT', 'STOP', 'STEP', 'NULL'].includes(mnemonic)) {
        wellInfo[mnemonic] = parseFloat(value) || wellInfo[mnemonic];
      } else {
        wellInfo[mnemonic] = value;
      }
    }
  }
  
  return wellInfo;
};

/**
 * Parses the curve information section
 */
const parseCurveSection = (curveSection: string): CurveInfo[] => {
  const curveInfo: CurveInfo[] = [];
  
  if (!curveSection) return curveInfo;
  
  const lines = curveSection.split(/\r?\n/);
  
  for (const line of lines) {
    // Skip comments or empty lines
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    
    // Extract mnemonic, unit, and description
    const match = line.match(/([^.]+)\.([^:]*):(.*)$/);
    if (match) {
      const name = match[1].trim();
      const unit = match[2].trim();
      const description = match[3].split('|')[0].trim();
      
      curveInfo.push({ name, unit, description });
    }
  }
  
  return curveInfo;
};

/**
 * Parse data section using streaming to handle large files
 */
const parseDataSectionStreaming = (dataContent: string, curveInfo: CurveInfo[]): LogData[] => {
  const CHUNK_SIZE = 1000; // Process 1000 lines at a time
  const logData: LogData[] = [];
  const curveNames = curveInfo.map(curve => curve.name);
  
  // Split into lines
  const lines = dataContent.split(/\r?\n/);
  
  // Process in chunks
  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, i + CHUNK_SIZE);
    
    // Parse chunk
    const parsedChunk = Papa.parse(chunk.join('\n'), {
      skipEmptyLines: true,
      delimiter: ' ',
      transform: (value) => value.trim() === '' ? null : value,
    });
    
    // Process each row in the chunk
    for (const row of parsedChunk.data) {
      const filteredRow = (row as any[]).filter(val => val !== null && val !== '').map(val => val.trim());
      
      if (filteredRow.length >= curveNames.length) {
        const rowData: { [curveName: string]: number } = {};
        const depth = parseFloat(filteredRow[0]);
        
        // Parse values for each curve
        for (let j = 1; j < curveNames.length; j++) {
          if (j < filteredRow.length) {
            const value = parseFloat(filteredRow[j]);
            if (!isNaN(value)) {
              rowData[curveNames[j]] = value;
            }
          }
        }
        
        logData.push({ depth, values: rowData });
      }
    }
  }
  
  return logData;
};

/**
 * Exports a LAS file structure back to LAS file format
 */
export const exportToLas = (lasFile: LasFile): string => {
  let output = '';
  
  // Version section
  output += `~VERSION INFORMATION\n`;
  output += `VERS. ${lasFile.version}   : LAS file format version\n`;
  output += `WRAP. NO   : One line per depth step\n\n`;
  
  // Well section
  output += `~WELL INFORMATION\n`;
  for (const [key, value] of Object.entries(lasFile.wellInfo)) {
    if (typeof value === 'number') {
      output += `${key.padEnd(8)}.${' '.repeat(4)}: ${value}\n`;
    } else {
      output += `${key.padEnd(8)}.${' '.repeat(4)}: ${value}\n`;
    }
  }
  output += '\n';
  
  // Curve section
  output += `~CURVE INFORMATION\n`;
  for (const curve of lasFile.curveInfo) {
    output += `${curve.name.padEnd(8)}.${curve.unit.padEnd(4)}: ${curve.description}\n`;
  }
  output += '\n';
  
  // Parameter section (if needed)
  output += `~PARAMETER INFORMATION\n\n`;
  
  // Other section (if needed)
  output += `~OTHER INFORMATION\n`;
  output += `Processed with Well Log Cleaner v0.1.0\n\n`;
  
  // ASCII log data section
  output += `~A  DEPTH     ${lasFile.curveInfo.slice(1).map(c => c.name.padEnd(12)).join('')}\n`;
  
  // Write data rows
  for (const row of lasFile.data) {
    let line = `${row.depth.toFixed(2).padEnd(12)}`;
    
    for (const curveName of Object.keys(row.values)) {
      const value = row.values[curveName];
      line += `${value.toFixed(6).padEnd(12)}`;
    }
    
    output += line + '\n';
  }
  
  return output;
};