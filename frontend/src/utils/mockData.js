export const generateMockCauldronData = (cauldrons) => {
  return cauldrons.map(cauldron => {
    const currentVolume = Math.round(Math.random() * cauldron.max_volume * 0.8 + cauldron.max_volume * 0.1);
    const fillRate = (Math.random() * 2 + 0.5).toFixed(2);
    const remainingCapacity = cauldron.max_volume - currentVolume;
    const timeToFull = Math.round(remainingCapacity / fillRate);
    
    // Determine if there's a discrepancy (20% chance)
    const hasDiscrepancy = Math.random() > 0.8;
    
    // Status priority: Critical (overflow) > Warning (discrepancy) > Collecting > Normal
    let status = 'normal';
    if (currentVolume > cauldron.max_volume * 0.9) {
      status = 'critical'; // Critical overflow - needs immediate attention
    } else if (hasDiscrepancy) {
      status = 'warning'; // Discrepancy detected - track this!
    } else if (Math.random() > 0.7) {
      status = 'collecting'; // Currently being collected by courier
    }
    
    return {
      ...cauldron,
      currentVolume,
      fillRate: parseFloat(fillRate),
      timeToFull: `${timeToFull} min`,
      status,
      hasDiscrepancy,
      maxVolume: cauldron.max_volume
    };
  });
};

export const generateMockDiscrepancies = (tickets, cauldrons) => {
  const discrepancies = [];
  
  tickets.slice(0, 15).forEach((ticket, index) => {
    if (Math.random() > 0.6) {
      const cauldron = cauldrons.find(c => c.id === ticket.cauldronId);
      const variance = (Math.random() * 20 - 10).toFixed(2);
      const severity = Math.abs(variance) > 10 ? 'high' : Math.abs(variance) > 5 ? 'medium' : 'low';
      
      discrepancies.push({
        id: `disc_${index}`,
        cauldronId: ticket.cauldronId,
        cauldronName: cauldron?.name || 'Unknown Cauldron',
        date: ticket.date,
        expectedVolume: ticket.volume,
        actualVolume: (ticket.volume + parseFloat(variance)).toFixed(2),
        variance: parseFloat(variance),
        severity,
        resolved: Math.random() > 0.7,
        description: variance > 0 
          ? `Transport ticket shows ${Math.abs(variance)}L more than actual drain volume`
          : `Transport ticket shows ${Math.abs(variance)}L less than actual drain volume`
      });
    }
  });
  
  return discrepancies;
};

export const generateHistoricalData = (days) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Base volumes for each cauldron (different starting points)
  const baseVolumes = {
    cauldron_001: 500,
    cauldron_002: 400,
    cauldron_003: 600,
    cauldron_004: 350,
    cauldron_005: 450,
    cauldron_006: 300,
    cauldron_007: 550,
    cauldron_008: 380,
    cauldron_009: 480,
    cauldron_010: 420,
    cauldron_011: 520,
    cauldron_012: 320
  };
  
  // Generate hourly data for the specified number of days
  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    const dataPoint = {
      timestamp: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })
    };
    
    // Generate data for all 12 cauldrons with different patterns
    Object.keys(baseVolumes).forEach(cauldronId => {
      const base = baseVolumes[cauldronId];
      const variation = Math.sin(i / 6) * 100; // Sinusoidal pattern
      const randomNoise = (Math.random() - 0.5) * 50; // Random fluctuation
      const value = Math.max(100, base + variation + randomNoise);
      dataPoint[cauldronId] = Math.round(value);
    });
    
    data.push(dataPoint);
  }
  
  return data;
};
