const fs = require('fs');
const path = require('path');

class TestIntelligence {
  constructor() {
    this.flakyTestPatterns = new Map();
    this.errorPatterns = new Map();
    this.testMetrics = new Map();
    this.initializePatterns();
  }

  initializePatterns() {
    // Bekannte Flaky Test Patterns
    this.flakyTestPatterns.set('timeout', {
      pattern: /timeout|TimeoutError|page\.waitFor/i,
      suggestion: 'Verwende explizite Waits statt feste Timeouts',
      autoFix: 'await expect(locator).toBeVisible({ timeout: 10000 });'
    });

    this.flakyTestPatterns.set('race-condition', {
      pattern: /click.*immediately|fast.*execution/i,
      suggestion: 'Füge Wartebedingungen zwischen Aktionen hinzu',
      autoFix: 'await page.waitForLoadState("networkidle");'
    });

    // Error Patterns
    this.errorPatterns.set('selector-not-found', {
      pattern: /locator.*not.*found|element.*not.*visible/i,
      type: 'selector-issue',
      solutions: [
        'Überprüfe data-pw Selektoren',
        'Verwende robustere CSS-Selektoren',
        'Füge explizite Waits hinzu'
      ]
    });

    this.errorPatterns.set('network-error', {
      pattern: /network.*error|connection.*refused|ECONNREFUSED/i,
      type: 'infrastructure',
      solutions: [
        'Überprüfe Backend-Server Status',
        'Implementiere Retry-Mechanismus',
        'Verwende Mock-Services für Tests'
      ]
    });
  }

  // Analysiere Test-Ausführungshistorie für Patterns
  analyzeTestHistory(testResults) {
    const analysis = {
      flakyTests: [],
      errorPatterns: [],
      performanceIssues: [],
      recommendations: []
    };

    testResults.forEach(result => {
      // Flaky Test Detection
      if (this.isFlaky(result)) {
        analysis.flakyTests.push({
          testName: result.testName,
          failureRate: this.calculateFailureRate(result),
          pattern: this.identifyFlakyPattern(result),
          suggestedFix: this.suggestFlakyFix(result)
        });
      }

      // Error Pattern Analysis
      const errorPattern = this.identifyErrorPattern(result.error);
      if (errorPattern) {
        analysis.errorPatterns.push({
          testName: result.testName,
          errorType: errorPattern.type,
          solutions: errorPattern.solutions,
          autoFixAvailable: this.hasAutoFix(errorPattern)
        });
      }

      // Performance Issues
      if (result.duration > 30000) { // > 30 Sekunden
        analysis.performanceIssues.push({
          testName: result.testName,
          duration: result.duration,
          suggestion: 'Test-Performance optimieren'
        });
      }
    });

    // Generiere Empfehlungen
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  // Prädiktive Test-Ausfälle
  predictTestFailures(testSuite) {
    const predictions = [];
    
    testSuite.tests.forEach(test => {
      const riskScore = this.calculateRiskScore(test);
      
      if (riskScore > 0.7) {
        predictions.push({
          testName: test.name,
          riskScore,
          riskFactors: this.identifyRiskFactors(test),
          preventiveMeasures: this.suggestPreventiveMeasures(test)
        });
      }
    });

    return {
      highRiskTests: predictions.filter(p => p.riskScore > 0.8),
      mediumRiskTests: predictions.filter(p => p.riskScore > 0.6 && p.riskScore <= 0.8),
      recommendations: this.generatePreventiveRecommendations(predictions)
    };
  }

  // Automatische Test-Optimierung
  optimizeTest(testContent, optimizationType = 'performance') {
    let optimizedTest = testContent;
    
    switch (optimizationType) {
      case 'performance':
        optimizedTest = this.optimizePerformance(optimizedTest);
        break;
      case 'stability':
        optimizedTest = this.optimizeStability(optimizedTest);
        break;
      case 'maintainability':
        optimizedTest = this.optimizeMaintainability(optimizedTest);
        break;
    }

    return {
      originalTest: testContent,
      optimizedTest,
      optimizations: this.getAppliedOptimizations(),
      improvement: this.calculateImprovement(testContent, optimizedTest)
    };
  }

  optimizePerformance(testContent) {
    let optimized = testContent;

    // Parallele Aktionen identifizieren
    optimized = optimized.replace(
      /(await page\..*;\s*await page\..*)/g,
      'await Promise.all([$1]);'
    );

    // Unnötige Waits entfernen
    optimized = optimized.replace(
      /await page\.waitForTimeout\(\d+\);/g,
      '// Removed unnecessary wait'
    );

    // Selector-Optimierung
    optimized = optimized.replace(
      /page\.locator\('\..*'\)/g,
      match => this.optimizeSelector(match)
    );

    return optimized;
  }

  optimizeStability(testContent) {
    let optimized = testContent;

    // Füge explizite Waits hinzu
    optimized = optimized.replace(
      /(await.*\.click\(\);)/g,
      '$1\n  await page.waitForLoadState("networkidle");'
    );

    // Robustere Selektoren
    optimized = optimized.replace(
      /page\.locator\('#.*'\)/g,
      match => this.makeRobustSelector(match)
    );

    // Retry-Mechanismus hinzufügen
    optimized = this.addRetryMechanism(optimized);

    return optimized;
  }

  // Auto-Healing für kaputte Tests
  async healBrokenTest(testFile, errorDetails) {
    const testContent = fs.readFileSync(testFile, 'utf8');
    const healingResult = {
      originalIssue: errorDetails,
      healingAttempts: [],
      suggestedFixes: [],
      autoFixApplied: false
    };

    // Analysiere Fehler-Typ
    const errorType = this.categorizeError(errorDetails);
    
    switch (errorType) {
      case 'selector-not-found':
        healingResult.healingAttempts.push(
          await this.healSelectorIssue(testContent, errorDetails)
        );
        break;
        
      case 'timing-issue':
        healingResult.healingAttempts.push(
          await this.healTimingIssue(testContent, errorDetails)
        );
        break;
        
      case 'data-dependency':
        healingResult.healingAttempts.push(
          await this.healDataIssue(testContent, errorDetails)
        );
        break;
    }

    // Bewerte beste Lösung
    const bestFix = this.selectBestFix(healingResult.healingAttempts);
    if (bestFix && bestFix.confidence > 0.8) {
      healingResult.autoFixApplied = true;
      healingResult.appliedFix = bestFix;
    }

    return healingResult;
  }

  async healSelectorIssue(testContent, errorDetails) {
    const failedSelector = this.extractFailedSelector(errorDetails);
    const alternativeSelectors = await this.findAlternativeSelectors(failedSelector);
    
    return {
      type: 'selector-replacement',
      originalSelector: failedSelector,
      alternatives: alternativeSelectors,
      confidence: this.calculateSelectorConfidence(alternativeSelectors),
      fix: alternativeSelectors.length > 0 ? alternativeSelectors[0] : null
    };
  }

  // Helper Methods
  isFlaky(testResult) {
    return testResult.attempts > 1 && testResult.failureRate > 0.2;
  }

  calculateFailureRate(testResult) {
    return testResult.failures / testResult.totalRuns;
  }

  calculateRiskScore(test) {
    let score = 0;
    
    // Komplexitäts-Faktoren
    const selectorCount = (test.content.match(/page\.locator/g) || []).length;
    score += Math.min(selectorCount * 0.1, 0.3);
    
    // Timing-abhängige Operationen
    const timingOps = (test.content.match(/waitFor|setTimeout/g) || []).length;
    score += Math.min(timingOps * 0.15, 0.4);
    
    // Netzwerk-Abhängigkeiten
    const networkOps = (test.content.match(/request\.|api\./g) || []).length;
    score += Math.min(networkOps * 0.2, 0.3);
    
    return Math.min(score, 1.0);
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.flakyTests.length > 0) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        message: `${analysis.flakyTests.length} flaky Tests identifiziert`,
        actions: ['Robustere Waits implementieren', 'Selector-Stabilität verbessern']
      });
    }
    
    if (analysis.performanceIssues.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `${analysis.performanceIssues.length} Performance-Probleme gefunden`,
        actions: ['Test-Parallelisierung', 'Unnötige Waits entfernen']
      });
    }
    
    return recommendations;
  }
}

module.exports = TestIntelligence;
