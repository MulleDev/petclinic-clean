const axios = require('axios');

/**
 * JIRA Reporter für Playwright Tests
 * Automatische Ticket-Erstellung für Failures und Test-Reports
 */
class JiraReporter {
  constructor() {
    this.jiraBaseUrl = 'http://localhost:3000'; // MCP-JIRA Server
    this.results = {
      passed: [],
      failed: [],
      skipped: [],
      flaky: []
    };
    this.startTime = null;
    this.endTime = null;
  }

  onBegin(config, suite) {
    this.startTime = new Date();
    console.log(`📊 Starting Playwright test suite with JIRA integration...`);
  }

  onTestEnd(test, result) {
    const testInfo = {
      title: test.title,
      file: test.location.file,
      line: test.location.line,
      duration: result.duration,
      status: result.status,
      error: result.error,
      retry: result.retry,
      screenshots: result.attachments?.filter(a => a.name === 'screenshot'),
      videos: result.attachments?.filter(a => a.name === 'video')
    };

    switch (result.status) {
      case 'passed':
        this.results.passed.push(testInfo);
        break;
      case 'failed':
        this.results.failed.push(testInfo);
        break;
      case 'skipped':
        this.results.skipped.push(testInfo);
        break;
      case 'timedOut':
        testInfo.error = 'Test timed out';
        this.results.failed.push(testInfo);
        break;
    }

    // Check for flaky tests (retry > 0 but passed)
    if (result.retry > 0 && result.status === 'passed') {
      this.results.flaky.push(testInfo);
    }
  }

  async onEnd(result) {
    this.endTime = new Date();
    const duration = this.endTime - this.startTime;

    console.log(`📋 Test execution completed. Creating JIRA reports...`);

    try {
      // Erstelle Test Suite Report
      await this.createSuiteReport(result, duration);

      // Erstelle Tickets für failed Tests
      for (const failedTest of this.results.failed) {
        await this.createTestFailureTicket(failedTest);
      }

      // Erstelle Tickets für flaky Tests
      for (const flakyTest of this.results.flaky) {
        await this.createFlakyTestTicket(flakyTest);
      }

      console.log(`✅ JIRA integration completed successfully`);
    } catch (error) {
      console.error(`❌ JIRA integration failed:`, error.message);
    }
  }

  async createSuiteReport(result, duration) {
    const total = this.results.passed.length + this.results.failed.length + this.results.skipped.length;
    const passRate = total > 0 ? ((this.results.passed.length / total) * 100).toFixed(1) : 0;

    const reportData = {
      template: 'playwright-suite-report',
      projectKey: 'TEST',
      customFields: {
        TOTAL_TESTS: total.toString(),
        PASSED_TESTS: this.results.passed.length.toString(),
        FAILED_TESTS: this.results.failed.length.toString(),
        SKIPPED_TESTS: this.results.skipped.length.toString(),
        FLAKY_TESTS: this.results.flaky.length.toString(),
        PASS_RATE: passRate,
        EXECUTION_TIME: this.formatDuration(duration),
        EXECUTION_DATE: this.formatDate(this.startTime),
        BROWSER_INFO: this.getBrowserInfo(),
        FAILED_TEST_LIST: this.getFailedTestsList(),
        FLAKY_TEST_LIST: this.getFlakyTestsList()
      }
    };

    const response = await axios.post(`${this.jiraBaseUrl}/jira/create-ticket`, reportData);
    console.log(`📊 Suite report ticket created: ${response.data.ticket?.key}`);
    return response.data;
  }

  async createTestFailureTicket(testInfo) {
    const errorMessage = testInfo.error?.message || 'Unknown error';
    const stackTrace = testInfo.error?.stack || 'No stack trace available';

    const ticketData = {
      template: 'playwright-test-failure',
      projectKey: 'TEST',
      customFields: {
        TEST_NAME: testInfo.title,
        TEST_FILE: testInfo.file,
        ERROR_MESSAGE: errorMessage,
        STACK_TRACE: stackTrace,
        EXECUTION_TIME: this.formatDuration(testInfo.duration),
        RETRY_COUNT: testInfo.retry.toString(),
        BROWSER_INFO: this.getBrowserInfo(),
        PLAYWRIGHT_VERSION: this.getPlaywrightVersion(),
        SCREENSHOTS: this.getAttachmentInfo(testInfo.screenshots),
        VIDEOS: this.getAttachmentInfo(testInfo.videos)
      }
    };

    const response = await axios.post(`${this.jiraBaseUrl}/jira/create-ticket`, ticketData);
    console.log(`🐛 Test failure ticket created for "${testInfo.title}": ${response.data.ticket?.key}`);
    return response.data;
  }

  async createFlakyTestTicket(testInfo) {
    const ticketData = {
      template: 'playwright-flaky-test',
      projectKey: 'TEST',
      customFields: {
        TEST_NAME: testInfo.title,
        TEST_FILE: testInfo.file,
        RETRY_COUNT: testInfo.retry.toString(),
        FINAL_DURATION: this.formatDuration(testInfo.duration),
        BROWSER_INFO: this.getBrowserInfo(),
        INVESTIGATION_NOTES: `Test passed after ${testInfo.retry} retries. Requires stability investigation.`
      }
    };

    const response = await axios.post(`${this.jiraBaseUrl}/jira/create-ticket`, ticketData);
    console.log(`⚠️ Flaky test ticket created for "${testInfo.title}": ${response.data.ticket?.key}`);
    return response.data;
  }

  getFailedTestsList() {
    return this.results.failed.map(test => 
      `- ${test.title} (${test.file}:${test.line})`
    ).join('\n');
  }

  getFlakyTestsList() {
    return this.results.flaky.map(test => 
      `- ${test.title} (${test.retry} retries)`
    ).join('\n');
  }

  getBrowserInfo() {
    return process.env.PLAYWRIGHT_BROWSER || 'chromium';
  }

  getPlaywrightVersion() {
    try {
      const pkg = require('@playwright/test/package.json');
      return pkg.version;
    } catch {
      return 'unknown';
    }
  }

  getAttachmentInfo(attachments = []) {
    if (attachments.length === 0) return 'None';
    return attachments.map(att => att.path || att.name).join(', ');
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  formatDate(date) {
    return date.toISOString().split('T')[0] + ' ' + 
           date.toTimeString().split(' ')[0];
  }
}

module.exports = JiraReporter;
