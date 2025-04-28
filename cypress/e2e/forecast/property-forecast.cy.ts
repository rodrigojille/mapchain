describe('Property Forecast', () => {
  beforeEach(() => {
    // Login as a property owner
    cy.window().then((win) => {
      win.localStorage.setItem('mapchain-token', 'fake-jwt-token');
      win.localStorage.setItem('mapchain-user', JSON.stringify({
        id: '1',
        email: 'owner@example.com',
        name: 'Property Owner',
        role: 'PROPERTY_OWNER'
      }));
    });
  });

  it('should display the forecast page', () => {
    cy.visit('/forecast');
    cy.contains('h1', 'Property Value Forecast').should('be.visible');
    cy.contains('Select a property to forecast its future value').should('be.visible');
  });

  it('should generate a property forecast with different timeframes', () => {
    // Mock the user properties response
    cy.intercept('GET', '/api/user/properties', {
      statusCode: 200,
      body: [
        {
          id: '123',
          address: {
            line1: '123 Ocean Drive',
            city: 'Miami',
            state: 'FL',
            zipCode: '33139'
          },
          currentValue: 750000,
          lastValuationDate: '2025-04-01T00:00:00.000Z'
        },
        {
          id: '124',
          address: {
            line1: '456 Palm Avenue',
            city: 'Miami',
            state: 'FL',
            zipCode: '33139'
          },
          currentValue: 850000,
          lastValuationDate: '2025-03-15T00:00:00.000Z'
        }
      ]
    }).as('getUserPropertiesRequest');

    // Mock the forecast API response for 1 year
    cy.intercept('POST', '/api/forecast', {
      body: {
        propertyId: '123',
        currentValue: 750000,
        timeframe: 1,
        forecastValue: 787500,
        confidenceInterval: {
          lower: 765000,
          upper: 810000
        },
        growthRate: 5,
        factorImpact: [
          { factor: 'Market Trends', impact: 0.4, description: 'Positive market growth in the area' },
          { factor: 'Property Improvements', impact: 0.3, description: 'Recent renovations add value' },
          { factor: 'Neighborhood Development', impact: 0.2, description: 'New amenities being built nearby' },
          { factor: 'Economic Indicators', impact: 0.1, description: 'Strong local economy' }
        ],
        monthlyProjection: [
          { month: 1, value: 753125 },
          { month: 2, value: 756250 },
          { month: 3, value: 759375 },
          { month: 4, value: 762500 },
          { month: 5, value: 765625 },
          { month: 6, value: 768750 },
          { month: 7, value: 771875 },
          { month: 8, value: 775000 },
          { month: 9, value: 778125 },
          { month: 10, value: 781250 },
          { month: 11, value: 784375 },
          { month: 12, value: 787500 }
        ]
      }
    }).as('getForecastRequest1Year');

    // Mock the forecast API response for 5 years
    cy.intercept('POST', '/api/forecast', {
      body: {
        propertyId: '123',
        currentValue: 750000,
        timeframe: 5,
        forecastValue: 956250,
        confidenceInterval: {
          lower: 900000,
          upper: 1012500
        },
        growthRate: 5,
        factorImpact: [
          { factor: 'Market Trends', impact: 0.4, description: 'Positive market growth in the area' },
          { factor: 'Property Improvements', impact: 0.3, description: 'Recent renovations add value' },
          { factor: 'Neighborhood Development', impact: 0.2, description: 'New amenities being built nearby' },
          { factor: 'Economic Indicators', impact: 0.1, description: 'Strong local economy' }
        ],
        yearlyProjection: [
          { year: 1, value: 787500 },
          { year: 2, value: 826875 },
          { year: 3, value: 868219 },
          { year: 4, value: 911630 },
          { year: 5, value: 956250 }
        ]
      }
    }).as('getForecastRequest5Years');

    // Mock the forecast API response for 10 years
    cy.intercept('POST', '/api/forecast', {
      body: {
        propertyId: '123',
        currentValue: 750000,
        timeframe: 10,
        forecastValue: 1221729,
        confidenceInterval: {
          lower: 1100000,
          upper: 1350000
        },
        growthRate: 5,
        factorImpact: [
          { factor: 'Market Trends', impact: 0.4, description: 'Positive market growth in the area' },
          { factor: 'Property Improvements', impact: 0.3, description: 'Recent renovations add value' },
          { factor: 'Neighborhood Development', impact: 0.2, description: 'New amenities being built nearby' },
          { factor: 'Economic Indicators', impact: 0.1, description: 'Strong local economy' }
        ],
        yearlyProjection: [
          { year: 1, value: 787500 },
          { year: 2, value: 826875 },
          { year: 3, value: 868219 },
          { year: 4, value: 911630 },
          { year: 5, value: 956250 },
          { year: 6, value: 1004063 },
          { year: 7, value: 1054266 },
          { year: 8, value: 1106979 },
          { year: 9, value: 1162328 },
          { year: 10, value: 1221729 }
        ]
      }
    }).as('getForecastRequest10Years');

    // Visit forecast page and select a property
    cy.visit('/forecast');
    cy.wait('@getUserPropertiesRequest');
    
    cy.get('select[name="propertyId"]').select('123');
    
    // Generate 1-year forecast
    cy.get('select[name="timeframe"]').select('1');
    cy.contains('button', 'Generate Forecast').click();
    cy.wait('@getForecastRequest1Year');
    
    // Check 1-year forecast results
    cy.contains('Forecast Value: $787,500').should('be.visible');
    cy.contains('Growth Rate: 5%').should('be.visible');
    cy.contains('Confidence Interval: $765,000 - $810,000').should('be.visible');
    
    // Check factor impact chart
    cy.contains('Market Trends').should('be.visible');
    cy.contains('Property Improvements').should('be.visible');
    cy.contains('Neighborhood Development').should('be.visible');
    cy.contains('Economic Indicators').should('be.visible');
    
    // Generate 5-year forecast
    cy.get('select[name="timeframe"]').select('5');
    cy.contains('button', 'Generate Forecast').click();
    cy.wait('@getForecastRequest5Years');
    
    // Check 5-year forecast results
    cy.contains('Forecast Value: $956,250').should('be.visible');
    cy.contains('Growth Rate: 5%').should('be.visible');
    cy.contains('Confidence Interval: $900,000 - $1,012,500').should('be.visible');
    
    // Generate 10-year forecast
    cy.get('select[name="timeframe"]').select('10');
    cy.contains('button', 'Generate Forecast').click();
    cy.wait('@getForecastRequest10Years');
    
    // Check 10-year forecast results
    cy.contains('Forecast Value: $1,221,729').should('be.visible');
    cy.contains('Growth Rate: 5%').should('be.visible');
    cy.contains('Confidence Interval: $1,100,000 - $1,350,000').should('be.visible');
  });

  it('should compare AI forecast with professional valuation', () => {
    // Mock the property data with both AI forecast and professional valuation
    cy.intercept('GET', '/api/properties/123', {
      statusCode: 200,
      body: {
        id: '123',
        address: {
          line1: '123 Ocean Drive',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139'
        },
        currentValue: 750000,
        lastValuationDate: '2025-04-01T00:00:00.000Z',
        valuations: [
          {
            id: '201',
            type: 'AI',
            value: 750000,
            date: '2025-04-01T00:00:00.000Z',
            confidence: 0.85
          },
          {
            id: '202',
            type: 'PROFESSIONAL',
            value: 735000,
            date: '2025-03-15T00:00:00.000Z',
            valuatorName: 'John Expert'
          }
        ]
      }
    }).as('getPropertyRequest');

    // Mock the comparison forecast API response
    cy.intercept('POST', '/api/forecast/compare', {
      body: {
        propertyId: '123',
        aiCurrentValue: 750000,
        professionalCurrentValue: 735000,
        timeframe: 5,
        aiForecastValue: 956250,
        professionalForecastValue: 937125,
        aiGrowthRate: 5,
        professionalGrowthRate: 5,
        aiConfidenceInterval: {
          lower: 900000,
          upper: 1012500
        },
        professionalConfidenceInterval: {
          lower: 882000,
          upper: 992250
        },
        yearlyProjection: [
          { year: 1, aiValue: 787500, professionalValue: 771750 },
          { year: 2, aiValue: 826875, professionalValue: 810338 },
          { year: 3, aiValue: 868219, professionalValue: 850854 },
          { year: 4, aiValue: 911630, professionalValue: 893397 },
          { year: 5, aiValue: 956250, professionalValue: 937125 }
        ]
      }
    }).as('getComparisonRequest');

    // Visit property details page
    cy.visit('/properties/123');
    cy.wait('@getPropertyRequest');
    
    // Navigate to forecast comparison
    cy.contains('button', 'Compare Valuations').click();
    
    // Set comparison parameters
    cy.get('select[name="timeframe"]').select('5');
    cy.contains('button', 'Generate Comparison').click();
    cy.wait('@getComparisonRequest');
    
    // Check comparison results
    cy.contains('AI Forecast: $956,250').should('be.visible');
    cy.contains('Professional Forecast: $937,125').should('be.visible');
    cy.contains('Difference: $19,125 (2.0%)').should('be.visible');
    
    // Check the comparison chart
    cy.contains('5-Year Value Projection').should('be.visible');
    cy.contains('AI Valuation').should('be.visible');
    cy.contains('Professional Valuation').should('be.visible');
  });

  it('should display factor impact analysis', () => {
    // Mock the forecast API response with detailed factor impact
    cy.intercept('POST', '/api/forecast/factors', {
      body: {
        propertyId: '123',
        currentValue: 750000,
        timeframe: 5,
        forecastValue: 956250,
        factorImpact: [
          { 
            factor: 'Market Trends', 
            impact: 0.4, 
            value: 382500,
            description: 'Positive market growth in the area',
            details: [
              { subfactor: 'Neighborhood Demand', impact: 0.5, value: 191250 },
              { subfactor: 'Inventory Levels', impact: 0.3, value: 114750 },
              { subfactor: 'Days on Market', impact: 0.2, value: 76500 }
            ]
          },
          { 
            factor: 'Property Improvements', 
            impact: 0.3, 
            value: 286875,
            description: 'Recent renovations add value',
            details: [
              { subfactor: 'Kitchen Renovation', impact: 0.4, value: 114750 },
              { subfactor: 'Bathroom Updates', impact: 0.3, value: 86063 },
              { subfactor: 'Energy Efficiency', impact: 0.2, value: 57375 },
              { subfactor: 'Landscaping', impact: 0.1, value: 28688 }
            ]
          },
          { 
            factor: 'Neighborhood Development', 
            impact: 0.2, 
            value: 191250,
            description: 'New amenities being built nearby',
            details: [
              { subfactor: 'New Shopping Center', impact: 0.4, value: 76500 },
              { subfactor: 'School Improvements', impact: 0.3, value: 57375 },
              { subfactor: 'Park Development', impact: 0.3, value: 57375 }
            ]
          },
          { 
            factor: 'Economic Indicators', 
            impact: 0.1, 
            value: 95625,
            description: 'Strong local economy',
            details: [
              { subfactor: 'Job Growth', impact: 0.5, value: 47813 },
              { subfactor: 'Income Levels', impact: 0.3, value: 28688 },
              { subfactor: 'Interest Rates', impact: 0.2, value: 19125 }
            ]
          }
        ]
      }
    }).as('getFactorImpactRequest');

    // Visit forecast page for a specific property
    cy.visit('/forecast/123');
    
    // Navigate to factor impact analysis
    cy.contains('button', 'Factor Impact Analysis').click();
    cy.wait('@getFactorImpactRequest');
    
    // Check factor impact analysis
    cy.contains('Factor Impact Analysis').should('be.visible');
    cy.contains('Market Trends: $382,500 (40%)').should('be.visible');
    cy.contains('Property Improvements: $286,875 (30%)').should('be.visible');
    cy.contains('Neighborhood Development: $191,250 (20%)').should('be.visible');
    cy.contains('Economic Indicators: $95,625 (10%)').should('be.visible');
    
    // Expand a factor to see subfactors
    cy.contains('Market Trends').click();
    cy.contains('Neighborhood Demand: $191,250 (50%)').should('be.visible');
    cy.contains('Inventory Levels: $114,750 (30%)').should('be.visible');
    cy.contains('Days on Market: $76,500 (20%)').should('be.visible');
    
    // Expand another factor
    cy.contains('Property Improvements').click();
    cy.contains('Kitchen Renovation: $114,750 (40%)').should('be.visible');
    cy.contains('Bathroom Updates: $86,063 (30%)').should('be.visible');
    cy.contains('Energy Efficiency: $57,375 (20%)').should('be.visible');
    cy.contains('Landscaping: $28,688 (10%)').should('be.visible');
  });
});
