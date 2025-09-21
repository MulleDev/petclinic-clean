class CrossPlatformTestGenerator {
  constructor() {
    this.deviceProfiles = this.initializeDeviceProfiles();
    this.browserProfiles = this.initializeBrowserProfiles();
  }

  initializeDeviceProfiles() {
    return {
      'desktop': {
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      },
      'tablet': {
        viewport: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      },
      'mobile': {
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      }
    };
  }

  initializeBrowserProfiles() {
    return {
      'chromium': {
        name: 'chromium',
        capabilities: ['webgl', 'css-grid', 'flexbox'],
        limitations: []
      },
      'firefox': {
        name: 'firefox',
        capabilities: ['webgl', 'css-grid', 'flexbox'],
        limitations: ['some-webgl-features']
      },
      'webkit': {
        name: 'webkit',
        capabilities: ['css-grid', 'flexbox'],
        limitations: ['some-modern-js-features']
      }
    };
  }

  // Generiere Cross-Platform Test Matrix
  generateTestMatrix(baseTest, platforms = ['desktop', 'tablet', 'mobile'], browsers = ['chromium', 'firefox', 'webkit']) {
    const testMatrix = {
      originalTest: baseTest,
      platformTests: [],
      browserTests: [],
      combinedTests: [],
      totalTests: 0
    };

    // Platform-spezifische Tests
    platforms.forEach(platform => {
      const platformTest = this.adaptTestForPlatform(baseTest, platform);
      testMatrix.platformTests.push({
        platform,
        test: platformTest,
        adaptations: this.getAdaptationsForPlatform(platform)
      });
    });

    // Browser-spezifische Tests
    browsers.forEach(browser => {
      const browserTest = this.adaptTestForBrowser(baseTest, browser);
      testMatrix.browserTests.push({
        browser,
        test: browserTest,
        adaptations: this.getAdaptationsForBrowser(browser)
      });
    });

    // Kombinierte Platform + Browser Tests
    platforms.forEach(platform => {
      browsers.forEach(browser => {
        const combinedTest = this.adaptTestForPlatformAndBrowser(baseTest, platform, browser);
        testMatrix.combinedTests.push({
          platform,
          browser,
          test: combinedTest,
          config: this.generateTestConfig(platform, browser)
        });
      });
    });

    testMatrix.totalTests = testMatrix.combinedTests.length;
    
    return testMatrix;
  }

  // Adaptiere Test für spezifische Platform
  adaptTestForPlatform(baseTest, platform) {
    let adaptedTest = baseTest;
    const profile = this.deviceProfiles[platform];

    // Mobile-spezifische Anpassungen
    if (profile.isMobile) {
      adaptedTest = this.addMobileAdaptations(adaptedTest);
    }

    // Touch-spezifische Anpassungen
    if (profile.hasTouch) {
      adaptedTest = this.addTouchAdaptations(adaptedTest);
    }

    // Viewport-spezifische Anpassungen
    adaptedTest = this.addViewportAdaptations(adaptedTest, profile.viewport);

    return adaptedTest;
  }

  addMobileAdaptations(test) {
    let adapted = test;

    // Ersetze Hover-Aktionen mit Tap
    adapted = adapted.replace(
      /\.hover\(\)/g,
      '.tap()'
    );

    // Füge mobile-spezifische Waits hinzu
    adapted = adapted.replace(
      /(test\('.*', async \({ page }\) => \{)/g,
      `$1
    // Mobile-spezifische Einstellungen
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ media: 'handheld' });`
    );

    // Scroll-Verhalten anpassen
    adapted = adapted.replace(
      /\.scrollIntoView\(\)/g,
      '.scrollIntoView({ behavior: "smooth" })'
    );

    return adapted;
  }

  addTouchAdaptations(test) {
    let adapted = test;

    // Ersetze Click mit Touch-Events
    adapted = adapted.replace(
      /\.click\(\)/g,
      '.touch()'
    );

    // Füge Touch-Gesten hinzu
    adapted = this.addTouchGestures(adapted);

    return adapted;
  }

  addTouchGestures(test) {
    // Füge Swipe-Funktionalität hinzu
    const touchHelpers = `
  // Touch Gesture Helpers
  async function swipeLeft(page, selector) {
    const element = page.locator(selector);
    const box = await element.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2);
      await page.touchscreen.tap(box.x + 10, box.y + box.height / 2);
    }
  }

  async function swipeRight(page, selector) {
    const element = page.locator(selector);
    const box = await element.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + 10, box.y + box.height / 2);
      await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2);
    }
  }`;

    return touchHelpers + '\n' + test;
  }

  addViewportAdaptations(test, viewport) {
    let adapted = test;

    // Füge Viewport-Setup hinzu
    adapted = adapted.replace(
      /(test\('.*', async \({ page }\) => \{)/g,
      `$1
    await page.setViewportSize(${JSON.stringify(viewport)});`
    );

    // Responsive Element Handling
    if (viewport.width < 768) {
      adapted = this.addMobileNavigationHandling(adapted);
    }

    return adapted;
  }

  addMobileNavigationHandling(test) {
    let adapted = test;

    // Hamburger Menu Handling
    adapted = adapted.replace(
      /(await.*navigation\..*\(\);)/g,
      `// Mobile Navigation
    const mobileMenuButton = page.locator('[data-pw="mobile-menu-toggle"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
    $1`
    );

    return adapted;
  }

  // Browser-spezifische Anpassungen
  adaptTestForBrowser(baseTest, browser) {
    let adaptedTest = baseTest;
    const profile = this.browserProfiles[browser];

    // Browser-spezifische Waits
    if (browser === 'webkit') {
      adaptedTest = this.addWebkitCompatibility(adaptedTest);
    } else if (browser === 'firefox') {
      adaptedTest = this.addFirefoxCompatibility(adaptedTest);
    }

    return adaptedTest;
  }

  addWebkitCompatibility(test) {
    let adapted = test;

    // Längere Timeouts für WebKit
    adapted = adapted.replace(
      /timeout: \d+/g,
      'timeout: 10000'
    );

    // WebKit-spezifische Selektoren
    adapted = adapted.replace(
      /page\.locator\('input\[type="file"\]'\)/g,
      'page.locator(\'input[type="file"]\').first()'
    );

    return adapted;
  }

  addFirefoxCompatibility(test) {
    let adapted = test;

    // Firefox-spezifische Waits
    adapted = adapted.replace(
      /(await.*\.click\(\);)/g,
      `$1
    await page.waitForTimeout(100); // Firefox stability`
    );

    return adapted;
  }

  // Kombinierte Platform + Browser Anpassung
  adaptTestForPlatformAndBrowser(baseTest, platform, browser) {
    let adaptedTest = baseTest;
    
    // Erst Platform-Anpassungen
    adaptedTest = this.adaptTestForPlatform(adaptedTest, platform);
    
    // Dann Browser-Anpassungen
    adaptedTest = this.adaptTestForBrowser(adaptedTest, browser);
    
    // Spezifische Kombinationen
    if (platform === 'mobile' && browser === 'webkit') {
      adaptedTest = this.addMobileSafariSpecifics(adaptedTest);
    }
    
    return adaptedTest;
  }

  addMobileSafariSpecifics(test) {
    let adapted = test;

    // iOS Safari spezifische Anpassungen
    adapted = adapted.replace(
      /(test\('.*', async \({ page }\) => \{)/g,
      `$1
    // iOS Safari specific setup
    await page.addInitScript(() => {
      // Disable iOS zoom
      document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
          event.preventDefault();
        }
      });
    });`
    );

    return adapted;
  }

  // Generiere Playwright Config für Cross-Platform Tests
  generateTestConfig(platform, browser) {
    const deviceProfile = this.deviceProfiles[platform];
    const browserProfile = this.browserProfiles[browser];

    return {
      name: `${platform}-${browser}`,
      use: {
        browserName: browserProfile.name,
        viewport: deviceProfile.viewport,
        userAgent: deviceProfile.userAgent,
        deviceScaleFactor: deviceProfile.deviceScaleFactor,
        isMobile: deviceProfile.isMobile,
        hasTouch: deviceProfile.hasTouch,
        // Browser-spezifische Optionen
        ...(browser === 'webkit' && { 
          launchOptions: { 
            args: ['--disable-web-security'] 
          } 
        })
      }
    };
  }

  // Generiere komplette Playwright Config mit allen Kombinationen
  generatePlaywrightConfig(testMatrix) {
    const projects = testMatrix.combinedTests.map(test => test.config);

    return `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  
  projects: [
${projects.map(project => `    {
      name: '${project.name}',
      use: ${JSON.stringify(project.use, null, 8)}
    }`).join(',\n')}
  ],

  // Cross-Platform Reporter
  reporter: [
    ['html', { 
      outputFolder: 'cross-platform-results',
      open: 'never' 
    }],
    ['json', { 
      outputFile: 'cross-platform-results.json' 
    }]
  ]
});`;
  }

  // Performance Comparison zwischen Platforms
  generatePerformanceTest(baseTest) {
    return `
import { test, expect } from '@playwright/test';

test.describe('Cross-Platform Performance', () => {
  ['desktop', 'tablet', 'mobile'].forEach(platform => {
    test(\`Performance on \${platform}\`, async ({ page }) => {
      const startTime = Date.now();
      
      // Platform-spezifisches Setup
      ${this.getPlatformSetup()}
      
      // Führe den ursprünglichen Test aus
      ${baseTest}
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Platform-spezifische Performance-Erwartungen
      const maxDuration = platform === 'mobile' ? 10000 : 5000;
      expect(duration).toBeLessThan(maxDuration);
      
      console.log(\`\${platform} Performance: \${duration}ms\`);
    });
  });
});`;
  }

  getPlatformSetup() {
    return `
      if (platform === 'mobile') {
        await page.setViewportSize({ width: 375, height: 667 });
      } else if (platform === 'tablet') {
        await page.setViewportSize({ width: 768, height: 1024 });
      } else {
        await page.setViewportSize({ width: 1920, height: 1080 });
      }`;
  }

  // Generiere Responsive Design Tests
  generateResponsiveTests(components) {
    return components.map(component => `
test('${component.name} - Responsive Behavior', async ({ page }) => {
  await page.goto('${component.url}');
  
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // Layout stabilization
    
    const element = page.locator('${component.selector}');
    await expect(element).toBeVisible();
    
    // Component-spezifische Responsive Checks
    ${this.generateResponsiveChecks(component)}
    
    // Screenshot für Visual Regression
    await expect(element).toHaveScreenshot(\`${component.name}-\${viewport.name}.png\`);
  }
});`).join('\n\n');
  }

  generateResponsiveChecks(component) {
    switch (component.type) {
      case 'navigation':
        return `
    if (viewport.width < 768) {
      // Mobile: Hamburger menu should be visible
      await expect(page.locator('[data-pw="mobile-menu-toggle"]')).toBeVisible();
    } else {
      // Desktop: Full navigation should be visible
      await expect(page.locator('[data-pw="desktop-nav"]')).toBeVisible();
    }`;
      
      case 'table':
        return `
    if (viewport.width < 768) {
      // Mobile: Table should scroll horizontally or stack
      const tableContainer = page.locator('${component.selector}');
      const scrollWidth = await tableContainer.evaluate(el => el.scrollWidth);
      const clientWidth = await tableContainer.evaluate(el => el.clientWidth);
      expect(scrollWidth >= clientWidth).toBeTruthy();
    }`;
      
      default:
        return '// Add component-specific responsive checks';
    }
  }

  getAdaptationsForPlatform(platform) {
    const adaptations = [];
    const profile = this.deviceProfiles[platform];

    if (profile.isMobile) {
      adaptations.push('Mobile navigation handling');
      adaptations.push('Touch gesture support');
    }

    if (profile.hasTouch) {
      adaptations.push('Touch-optimized interactions');
    }

    adaptations.push(`Viewport: ${profile.viewport.width}x${profile.viewport.height}`);

    return adaptations;
  }

  getAdaptationsForBrowser(browser) {
    const adaptations = [];
    const profile = this.browserProfiles[browser];

    if (browser === 'webkit') {
      adaptations.push('Extended timeouts for stability');
      adaptations.push('iOS Safari specific workarounds');
    }

    if (browser === 'firefox') {
      adaptations.push('Firefox-specific wait strategies');
    }

    adaptations.push(`Browser capabilities: ${profile.capabilities.join(', ')}`);

    return adaptations;
  }
}

module.exports = CrossPlatformTestGenerator;
