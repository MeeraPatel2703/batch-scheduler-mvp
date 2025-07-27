import React, { useState } from 'react';
import { Button, Box, Typography, Alert, Stack } from '@mui/material';
import { MOCK_BATCHES } from '../types';
import { detectSchedulingConflicts, timeRangesOverlap } from '../utils/conflictDetection';

// Test scenarios for batch creation
const BatchCreationTests: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Adjacent times should NOT conflict
    const test1Start = new Date('2024-07-24T09:00:00Z');
    const test1End = new Date('2024-07-24T17:00:00Z');
    const test1Start2 = new Date('2024-07-24T17:00:00Z');
    const test1End2 = new Date('2024-07-24T20:00:00Z');
    
    const adjacent = timeRangesOverlap(test1Start, test1End, test1Start2, test1End2);
    results.push(`✅ Adjacent times (9-17, 17-20): ${adjacent ? 'CONFLICT (WRONG)' : 'NO CONFLICT (CORRECT)'}`);
    
    // Test 2: Exact same time range should conflict
    const test2Start = new Date('2024-07-24T08:00:00Z');
    const test2End = new Date('2024-07-24T16:00:00Z');
    
    const exact = timeRangesOverlap(test2Start, test2End, test2Start, test2End);
    results.push(`✅ Exact same time (8-16, 8-16): ${exact ? 'CONFLICT (CORRECT)' : 'NO CONFLICT (WRONG)'}`);
    
    // Test 3: Partial overlap - new starts during existing
    const test3Start = new Date('2024-07-24T08:00:00Z');
    const test3End = new Date('2024-07-24T16:00:00Z');
    const test3Start2 = new Date('2024-07-24T12:00:00Z');
    const test3End2 = new Date('2024-07-24T20:00:00Z');
    
    const partialStart = timeRangesOverlap(test3Start, test3End, test3Start2, test3End2);
    results.push(`✅ Partial overlap start (8-16, 12-20): ${partialStart ? 'CONFLICT (CORRECT)' : 'NO CONFLICT (WRONG)'}`);
    
    // Test 4: Partial overlap - new ends during existing
    const test4Start = new Date('2024-07-24T04:00:00Z');
    const test4End = new Date('2024-07-24T12:00:00Z');
    const test4Start2 = new Date('2024-07-24T08:00:00Z');
    const test4End2 = new Date('2024-07-24T16:00:00Z');
    
    const partialEnd = timeRangesOverlap(test4Start, test4End, test4Start2, test4End2);
    results.push(`✅ Partial overlap end (4-12, 8-16): ${partialEnd ? 'CONFLICT (CORRECT)' : 'NO CONFLICT (WRONG)'}`);
    
    // Test 5: New completely contains existing
    const test5Start = new Date('2024-07-24T06:00:00Z');
    const test5End = new Date('2024-07-24T18:00:00Z');
    const test5Start2 = new Date('2024-07-24T08:00:00Z');
    const test5End2 = new Date('2024-07-24T16:00:00Z');
    
    const contains = timeRangesOverlap(test5Start, test5End, test5Start2, test5End2);
    results.push(`✅ New contains existing (6-18, 8-16): ${contains ? 'CONFLICT (CORRECT)' : 'NO CONFLICT (WRONG)'}`);
    
    // Test 6: Same time, different equipment - should NOT conflict
    const conflictInfo = detectSchedulingConflicts(
      'eq-002', // Different equipment
      new Date('2024-07-24T08:00:00Z'),
      new Date('2024-07-24T16:00:00Z'),
      MOCK_BATCHES
    );
    results.push(`✅ Same time, different equipment: ${conflictInfo.hasConflicts ? 'CONFLICT (WRONG)' : 'NO CONFLICT (CORRECT)'}`);
    
    // Test 7: Same equipment, overlapping time - should conflict
    const conflictInfo2 = detectSchedulingConflicts(
      'eq-001', // Same equipment as existing batch
      new Date('2024-07-24T12:00:00Z'),
      new Date('2024-07-24T20:00:00Z'),
      MOCK_BATCHES
    );
    results.push(`✅ Same equipment, overlapping time: ${conflictInfo2.hasConflicts ? 'CONFLICT (CORRECT)' : 'NO CONFLICT (WRONG)'}`);
    
    setTestResults(results);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Batch Creation Conflict Detection Tests
      </Typography>
      
      <Button variant="contained" onClick={runTests} sx={{ mb: 3 }}>
        Run All Tests
      </Button>
      
      <Stack spacing={1}>
        {testResults.map((result, index) => (
          <Alert 
            key={index} 
            severity={result.includes('WRONG') ? 'error' : 'success'}
          >
            <Typography variant="body2">{result}</Typography>
          </Alert>
        ))}
      </Stack>
      
      {testResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Expected Behavior:</Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Adjacent times (9-5 then 5-8) should NOT conflict</li>
              <li>Exact same time range should conflict</li>
              <li>Partial overlaps should conflict</li>
              <li>One batch containing another should conflict</li>
              <li>Same time, different equipment should NOT conflict</li>
              <li>Same equipment, overlapping time should conflict</li>
            </ul>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BatchCreationTests;