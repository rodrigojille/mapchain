describe('Property Valuation', () => {
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
    
    cy.visit('/properties');
  });

  it('should request an AI valuation for a property', () => {
    // Mock the property data
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
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 2000,
          yearBuilt: 2010
        },
        images: ['property1.jpg'],
        ownerId: '1'
      }
    }).as('getPropertyRequest');

    // Mock the AI valuation response
    cy.intercept('POST', '/api/valuation/ai', {
      statusCode: 200,
      body: {
        propertyId: '123',
        value: 750000,
        confidence: 0.85,
        factors: [
          { name: 'Location', impact: 0.4, value: 300000 },
          { name: 'Size', impact: 0.3, value: 225000 },
          { name: 'Age', impact: 0.2, value: 150000 },
          { name: 'Amenities', impact: 0.1, value: 75000 }
        ],
        timestamp: new Date().toISOString()
      }
    }).as('aiValuationRequest');

    // Visit property details page
    cy.visit('/properties/123');
    cy.wait('@getPropertyRequest');
    
    // Request AI valuation
    cy.contains('button', 'Get AI Valuation').click();
    cy.wait('@aiValuationRequest');
    
    // Check valuation results
    cy.contains('Property Valuation').should('be.visible');
    cy.contains('$750,000').should('be.visible');
    cy.contains('Confidence: 85%').should('be.visible');
    
    // Check valuation factors
    cy.contains('Location').should('be.visible');
    cy.contains('Size').should('be.visible');
    cy.contains('Age').should('be.visible');
    cy.contains('Amenities').should('be.visible');
  });

  it('should request a professional valuation', () => {
    // Mock the property data
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
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 2000,
          yearBuilt: 2010
        },
        images: ['property1.jpg'],
        ownerId: '1'
      }
    }).as('getPropertyRequest');

    // Mock the valuator search response
    cy.intercept('GET', '/api/valuators', {
      statusCode: 200,
      body: [
        {
          id: '101',
          name: 'John Expert',
          rating: 4.8,
          completedValuations: 156,
          specialization: 'Residential',
          fee: 500
        },
        {
          id: '102',
          name: 'Sarah Appraiser',
          rating: 4.9,
          completedValuations: 203,
          specialization: 'Luxury Properties',
          fee: 750
        }
      ]
    }).as('getValuatorsRequest');

    // Mock the valuation request response
    cy.intercept('POST', '/api/valuation/request', {
      statusCode: 201,
      body: {
        id: '456',
        propertyId: '123',
        valuatorId: '101',
        status: 'PENDING',
        fee: 500,
        escrowTransactionId: '0.0.12345@1234567890.000000000',
        createdAt: new Date().toISOString()
      }
    }).as('valuationRequestCreate');

    // Visit property details page
    cy.visit('/properties/123');
    cy.wait('@getPropertyRequest');
    
    // Request professional valuation
    cy.contains('button', 'Request Professional Valuation').click();
    
    // Select a valuator
    cy.wait('@getValuatorsRequest');
    cy.contains('John Expert').click();
    cy.contains('button', 'Request Valuation').click();
    
    // Confirm payment
    cy.contains('Valuation Fee: $500').should('be.visible');
    cy.contains('button', 'Confirm & Pay').click();
    
    cy.wait('@valuationRequestCreate');
    
    // Check success message
    cy.contains('Valuation request submitted successfully').should('be.visible');
    cy.contains('Escrow payment confirmed').should('be.visible');
  });

  it('should view valuation history for a property', () => {
    // Mock the property data
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
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 2000,
          yearBuilt: 2010
        },
        images: ['property1.jpg'],
        ownerId: '1'
      }
    }).as('getPropertyRequest');

    // Mock the valuation history response
    cy.intercept('GET', '/api/properties/123/valuations', {
      statusCode: 200,
      body: [
        {
          id: '201',
          type: 'AI',
          value: 720000,
          date: '2025-01-15T00:00:00.000Z',
          confidence: 0.82
        },
        {
          id: '202',
          type: 'PROFESSIONAL',
          value: 735000,
          date: '2025-02-10T00:00:00.000Z',
          valuatorName: 'John Expert'
        },
        {
          id: '203',
          type: 'AI',
          value: 750000,
          date: '2025-04-05T00:00:00.000Z',
          confidence: 0.85
        }
      ]
    }).as('getValuationHistoryRequest');

    // Visit property details page
    cy.visit('/properties/123');
    cy.wait('@getPropertyRequest');
    
    // View valuation history
    cy.contains('button', 'Valuation History').click();
    cy.wait('@getValuationHistoryRequest');
    
    // Check valuation history
    cy.contains('Valuation History').should('be.visible');
    cy.contains('AI Valuation').should('be.visible');
    cy.contains('Professional Valuation').should('be.visible');
    cy.contains('$720,000').should('be.visible');
    cy.contains('$735,000').should('be.visible');
    cy.contains('$750,000').should('be.visible');
    cy.contains('John Expert').should('be.visible');
  });
});

describe('Valuator Dashboard', () => {
  beforeEach(() => {
    // Login as a valuator
    cy.window().then((win) => {
      win.localStorage.setItem('mapchain-token', 'fake-jwt-token');
      win.localStorage.setItem('mapchain-user', JSON.stringify({
        id: '101',
        email: 'valuator@example.com',
        name: 'John Expert',
        role: 'VALUATOR'
      }));
    });
    
    cy.visit('/dashboard');
  });

  it('should display pending valuation requests', () => {
    // Mock the pending requests response
    cy.intercept('GET', '/api/valuator/requests?status=PENDING', {
      statusCode: 200,
      body: [
        {
          id: '456',
          propertyId: '123',
          propertyAddress: '123 Ocean Drive, Miami, FL 33139',
          requestDate: '2025-04-10T00:00:00.000Z',
          fee: 500,
          status: 'PENDING'
        },
        {
          id: '457',
          propertyId: '124',
          propertyAddress: '456 Palm Avenue, Miami, FL 33139',
          requestDate: '2025-04-11T00:00:00.000Z',
          fee: 600,
          status: 'PENDING'
        }
      ]
    }).as('getPendingRequestsRequest');

    // Check pending requests tab
    cy.contains('Pending Requests').click();
    cy.wait('@getPendingRequestsRequest');
    
    cy.contains('123 Ocean Drive').should('be.visible');
    cy.contains('456 Palm Avenue').should('be.visible');
    cy.contains('$500').should('be.visible');
    cy.contains('$600').should('be.visible');
  });

  it('should complete a valuation request', () => {
    // Mock the property data
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
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 2000,
          yearBuilt: 2010
        },
        images: ['property1.jpg']
      }
    }).as('getPropertyRequest');

    // Mock the valuation request details
    cy.intercept('GET', '/api/valuation/request/456', {
      statusCode: 200,
      body: {
        id: '456',
        propertyId: '123',
        propertyAddress: '123 Ocean Drive, Miami, FL 33139',
        requestDate: '2025-04-10T00:00:00.000Z',
        fee: 500,
        status: 'PENDING'
      }
    }).as('getRequestDetailsRequest');

    // Mock the valuation submission response
    cy.intercept('POST', '/api/valuation/complete/456', {
      statusCode: 200,
      body: {
        success: true,
        transactionId: '0.0.12345@1234567890.000000000',
        status: 'COMPLETED'
      }
    }).as('completeValuationRequest');

    // Visit valuation request page
    cy.visit('/valuator/request/456');
    cy.wait('@getRequestDetailsRequest');
    cy.wait('@getPropertyRequest');
    
    // Fill valuation form
    cy.get('input[name="valuationAmount"]').type('735000');
    cy.get('textarea[name="valuationReport"]').type('This property is in excellent condition in a prime location. The recent renovations and market trends in the area support a valuation of $735,000.');
    
    // Add valuation factors
    cy.contains('button', 'Add Factor').click();
    cy.get('input[name="factors.0.name"]').type('Location');
    cy.get('input[name="factors.0.impact"]').type('40');
    cy.get('input[name="factors.0.value"]').type('294000');
    
    cy.contains('button', 'Add Factor').click();
    cy.get('input[name="factors.1.name"]').type('Property Condition');
    cy.get('input[name="factors.1.impact"]').type('30');
    cy.get('input[name="factors.1.value"]').type('220500');
    
    cy.contains('button', 'Add Factor').click();
    cy.get('input[name="factors.2.name"]').type('Market Trends');
    cy.get('input[name="factors.2.impact"]').type('30');
    cy.get('input[name="factors.2.value"]').type('220500');
    
    // Submit valuation
    cy.contains('button', 'Submit Valuation').click();
    cy.wait('@completeValuationRequest');
    
    // Check success message
    cy.contains('Valuation completed successfully').should('be.visible');
    cy.contains('Payment of $500 has been released from escrow').should('be.visible');
  });

  it('should display valuator performance metrics', () => {
    // Mock the performance metrics response
    cy.intercept('GET', '/api/valuator/metrics', {
      statusCode: 200,
      body: {
        completedValuations: 156,
        averageRating: 4.8,
        totalEarnings: 78000,
        recentActivity: [
          {
            id: '458',
            propertyAddress: '789 Beach Road, Miami, FL 33139',
            completionDate: '2025-04-05T00:00:00.000Z',
            fee: 550,
            rating: 5
          },
          {
            id: '459',
            propertyAddress: '101 Sunset Drive, Miami, FL 33139',
            completionDate: '2025-04-02T00:00:00.000Z',
            fee: 500,
            rating: 4
          }
        ]
      }
    }).as('getMetricsRequest');

    // Check performance tab
    cy.contains('Performance').click();
    cy.wait('@getMetricsRequest');
    
    cy.contains('Completed Valuations: 156').should('be.visible');
    cy.contains('Average Rating: 4.8').should('be.visible');
    cy.contains('Total Earnings: $78,000').should('be.visible');
    cy.contains('789 Beach Road').should('be.visible');
    cy.contains('101 Sunset Drive').should('be.visible');
  });
});
