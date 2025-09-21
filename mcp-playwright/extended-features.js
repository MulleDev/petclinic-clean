// === ALLE NEUEN ERWEITERTEN FEATURES ===

// AI-POWERED TEST INTELLIGENCE
app.post('/playwright/analyze-test-intelligence', async (req, res) => {
  const { testResults, analysisType = 'full' } = req.body;
  
  try {
    let analysis;
    
    switch (analysisType) {
      case 'flaky':
        analysis = testIntelligence.analyzeTestHistory(testResults);
        break;
      case 'predictive':
        analysis = testIntelligence.predictTestFailures(testResults);
        break;
      case 'optimization':
        analysis = testIntelligence.optimizeTest(testResults.testContent, testResults.optimizationType);
        break;
      default:
        analysis = {
          history: testIntelligence.analyzeTestHistory(testResults),
          predictions: testIntelligence.predictTestFailures(testResults),
          recommendations: testIntelligence.generateRecommendations(testResults)
        };
    }
    
    res.json({
      success: true,
      analysisType,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// INTERACTIVE TEST BUILDER
app.post('/playwright/start-test-builder', async (req, res) => {
  const { testType, feature } = req.body;
  
  try {
    const session = interactiveTestBuilder.startSession(testType, feature);
    
    res.json({
      success: true,
      sessionId: session.sessionId,
      currentStep: session.currentStep,
      testType,
      feature
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// CROSS-PLATFORM TEST GENERATION
app.post('/playwright/generate-cross-platform', async (req, res) => {
  const { baseTest, platforms = ['desktop', 'tablet', 'mobile'], browsers = ['chromium', 'firefox', 'webkit'] } = req.body;
  
  try {
    const testMatrix = crossPlatformGenerator.generateTestMatrix(baseTest, platforms, browsers);
    const playwrightConfig = crossPlatformGenerator.generatePlaywrightConfig(testMatrix);
    
    res.json({
      success: true,
      testMatrix,
      playwrightConfig,
      totalTests: testMatrix.totalTests,
      recommendations: [
        'Teste kritische Flows auf allen Plattformen',
        'Fokussiere auf Mobile-First für neue Features',
        'Verwende Visual Regression für UI-Konsistenz'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TEST ANALYTICS DASHBOARD
app.get('/playwright/analytics/dashboard', async (req, res) => {
  try {
    const dashboardData = testAnalytics.getDashboardData();
    
    res.json({
      success: true,
      dashboard: dashboardData,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/playwright/analytics/coverage-heatmap', async (req, res) => {
  try {
    const heatmap = testAnalytics.generateCoverageHeatmap();
    
    res.json({
      success: true,
      heatmap,
      visualization: {
        type: 'heatmap',
        colorScale: ['#ff0000', '#ffff00', '#00ff00'],
        title: 'Test Coverage Heatmap'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
